import type { Response, NextFunction } from 'express';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { limit = '50', cursor } = req.query;

    const limitNumber = parseInt(limit as string, 10) || 50;
    
    // Find the single private conversation
    const conversation = await Conversation.findOne();
    if (!conversation) {
      sendSuccess(res, { messages: [], nextCursor: null });
      return;
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      throw new UnauthorizedError('Not a participant of this conversation');
    }

    const query: any = { conversationId: conversation._id };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor as string) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .populate('replyTo', 'senderId content');

    // Return in chronological order
    const chronologicalMessages = messages.reverse();

    const nextCursor = messages.length === limitNumber ? messages[messages.length - 1].createdAt : null;

    sendSuccess(res, { messages: chronologicalMessages, nextCursor });
  } catch (error) {
    next(error);
  }
};
