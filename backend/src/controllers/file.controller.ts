import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Conversation } from '../models/Conversation.js';
import { FileMetadata } from '../models/FileMetadata.js';
import { Message } from '../models/Message.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors.js';
import type { AuthRequest } from '../middleware/auth.js';

export const uploadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const file = req.file;

    if (!file) {
      throw new BadRequestError('No file uploaded');
    }

    // Verify conversation
    const conversation = await Conversation.findOne({ participants: user._id });
    if (!conversation) {
      throw new BadRequestError('No active conversation');
    }
    const partnerId = conversation.participants.find(p => p.toString() !== user._id.toString());
    if (!partnerId) {
      throw new BadRequestError('Conversation has no partner');
    }

    let msgType = 'file';
    if (file.mimetype.startsWith('image/')) msgType = 'image';
    else if (file.mimetype.startsWith('video/')) msgType = 'video';
    else if (file.mimetype.startsWith('audio/')) msgType = 'voice';

    // Store Metadata
    const fileMeta = await FileMetadata.create({
      conversationId: conversation._id,
      senderId: user._id,
      receiverId: partnerId,
      originalName: file.originalname,
      storagePath: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    });

    // Create Message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: user._id,
      content: file.originalname,
      messageType: msgType,
      attachments: [{
        url: `/api/files/${fileMeta._id}`,
        type: file.mimetype,
        name: file.originalname,
        size: file.size,
      }],
      status: 'sent',
    });

    fileMeta.messageId = newMessage._id;
    await fileMeta.save();

    const populatedMessage = await newMessage.populate('replyTo', 'senderId content');

    const io = req.app.get('io');
    if (io) {
      io.to(conversation._id.toString()).emit('message:new', populatedMessage);
    }

    sendSuccess(res, { message: populatedMessage });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const downloadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const fileMeta = await FileMetadata.findById(id);
    if (!fileMeta) {
      throw new NotFoundError('File not found');
    }

    // Check conversation access
    const conversation = await Conversation.findById(fileMeta.conversationId);
    if (!conversation || !conversation.participants.includes(user._id)) {
      throw new UnauthorizedError('Not authorized to access this file');
    }

    const filePath = path.join(process.cwd(), 'uploads', fileMeta.storagePath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found on disk');
    }

    res.setHeader('Content-Type', fileMeta.mimeType);
    // If it's an image/video/audio, we probably want to inline it or allow range requests.
    // express res.sendFile handles range requests!
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export const getMediaVault = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    
    const conversation = await Conversation.findOne({ participants: user._id });
    if (!conversation) {
      sendSuccess(res, { files: [] });
      return;
    }

    const files = await FileMetadata.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 });

    sendSuccess(res, { files });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const fileMeta = await FileMetadata.findById(id);
    if (!fileMeta) {
      throw new NotFoundError('File not found');
    }

    if (fileMeta.senderId.toString() !== user._id.toString()) {
      throw new UnauthorizedError('Only the sender can delete this file');
    }

    // Delete message if exists
    if (fileMeta.messageId) {
      await Message.findByIdAndUpdate(fileMeta.messageId, {
        isDeleted: true,
        content: 'This message was deleted',
        attachments: [],
      });
    }

    // Remove from disk
    const filePath = path.join(process.cwd(), 'uploads', fileMeta.storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete metadata
    await fileMeta.deleteOne();

    sendSuccess(res, { message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};
