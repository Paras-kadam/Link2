import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';

interface JwtPayload {
  userId: string;
}

export function setupSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:517') || origin === env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error('Unauthorized or inactive account'));
      }

      // Attach user ID to socket data
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`[socket] User connected: ${userId}`);

    // Join the deterministic 2-user private conversation room
    let conversation = await Conversation.findOne();
    
    if (!conversation) {
      // If conversation doesn't exist, this means no chat started yet.
      // Fetch the exactly 2 users and create it.
      const users = await User.find();
      if (users.length === 2) {
        conversation = await Conversation.create({
          participants: [users[0]._id, users[1]._id]
        });
      }
    }

    if (conversation) {
      socket.join(conversation._id.toString());
      socket.data.conversationId = conversation._id.toString();
    }

    // Set user online
    await User.findByIdAndUpdate(userId, { status: 'online' });
    socket.broadcast.emit('user:online', { userId });

    socket.on('disconnect', async () => {
      console.log(`[socket] User disconnected: ${userId}`);
      await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
      socket.broadcast.emit('user:offline', { userId, lastSeen: new Date() });
    });

    // Handle typing events
    socket.on('typing:start', () => {
      if (socket.data.conversationId) {
        socket.to(socket.data.conversationId).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', () => {
      if (socket.data.conversationId) {
        socket.to(socket.data.conversationId).emit('typing:stop', { userId });
      }
    });

    // Handle sending message
    socket.on('message:send', async (payload, callback) => {
      try {
        const { content, type = 'text', replyTo } = payload;
        
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          throw new Error('Invalid message content');
        }

        if (!socket.data.conversationId) {
          throw new Error('No active conversation');
        }

        const newMessage = await Message.create({
          conversationId: socket.data.conversationId,
          senderId: userId,
          content: content.trim(),
          messageType: type,
          replyTo: replyTo || null,
          status: 'sent',
        });

        const populatedMessage = await newMessage.populate('replyTo', 'senderId content');

        // Broadcast to others in the room
        socket.to(socket.data.conversationId).emit('message:new', populatedMessage);
        
        // Acknowledge back to sender with the saved message
        if (callback) callback({ success: true, message: populatedMessage });

      } catch (error: any) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle marking message as read
    socket.on('message:read', async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg && msg.senderId.toString() !== userId && msg.status !== 'read') {
          msg.status = 'read';
          await msg.save();
          socket.to(socket.data.conversationId).emit('message:status', { messageId, status: 'read' });
        }
      } catch (error) {
        console.error('[socket] error marking read', error);
      }
    });

    // Handle edit
    socket.on('message:edit', async (payload, callback) => {
      try {
        const { messageId, content } = payload;
        if (!content || content.trim().length === 0) throw new Error('Invalid content');

        const msg = await Message.findById(messageId);
        if (!msg) throw new Error('Message not found');
        if (msg.senderId.toString() !== userId) throw new Error('Unauthorized');
        
        msg.content = content.trim();
        msg.isEdited = true;
        await msg.save();

        const populatedMsg = await msg.populate('replyTo', 'senderId content');
        io.to(socket.data.conversationId).emit('message:updated', populatedMsg);

        if (callback) callback({ success: true, message: populatedMsg });
      } catch (error: any) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle delete (soft delete)
    socket.on('message:delete', async (payload, callback) => {
      try {
        const { messageId } = payload;
        const msg = await Message.findById(messageId);
        if (!msg) throw new Error('Message not found');
        if (msg.senderId.toString() !== userId) throw new Error('Unauthorized');

        msg.isDeleted = true;
        msg.content = 'This message was deleted';
        await msg.save();

        io.to(socket.data.conversationId).emit('message:deleted', { messageId });

        if (callback) callback({ success: true });
      } catch (error: any) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle reactions
    socket.on('reaction:toggle', async (payload, callback) => {
      try {
        const { messageId, emoji } = payload;
        const msg = await Message.findById(messageId);
        if (!msg) throw new Error('Message not found');

        const existingReactionIndex = msg.reactions.findIndex(
          (r) => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          // Remove reaction
          msg.reactions.splice(existingReactionIndex, 1);
        } else {
          // Add reaction
          msg.reactions.push({ userId, emoji, createdAt: new Date() } as any);
        }

        await msg.save();
        io.to(socket.data.conversationId).emit('message:updated', msg);

        if (callback) callback({ success: true, message: msg });
      } catch (error: any) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // --- WebRTC Signaling Events ---

    const emitToPartner = async (event: string, ...args: any[]) => {
      console.log(`[CALL DEBUG] emitToPartner attempt for event: ${event}`);
      console.log(`[CALL DEBUG] Current socket conversationId: ${socket.data.conversationId}`);
      if (!socket.data.conversationId) {
        console.log(`[CALL DEBUG] FAILED - no conversationId on socket`);
        return;
      }
      const sockets = await io.in(socket.data.conversationId).fetchSockets();
      console.log(`[CALL DEBUG] Sockets found in room ${socket.data.conversationId}: ${sockets.length}`);
      
      let emitted = false;
      for (const s of sockets) {
        console.log(`[CALL DEBUG] Checking socket: ${s.id} (userId: ${s.data.userId}) against caller userId: ${userId}`);
        if (s.data.userId !== userId) {
          console.log(`[CALL DEBUG] MATCH FOUND! Emitting ${event} to socket ${s.id}`);
          s.emit(event, ...args);
          emitted = true;
        }
      }
      if (!emitted) {
        console.log(`[CALL DEBUG] WARNING - Event ${event} was NOT emitted to any partner. Is partner connected?`);
      }
    };

    socket.on('call:start', (payload) => {
      console.log(`[CALL DEBUG] call:start received from ${userId} (socket: ${socket.id})`);
      emitToPartner('call:incoming', {
        callerId: userId,
        type: payload.type,
      });
    });

    socket.on('call:accept', () => {
      emitToPartner('call:accept');
    });

    socket.on('call:reject', () => {
      emitToPartner('call:reject');
    });

    socket.on('call:cancel', () => {
      emitToPartner('call:cancel');
    });

    socket.on('call:end', () => {
      emitToPartner('call:end');
    });

    socket.on('call:busy', () => {
      emitToPartner('call:busy');
    });

    socket.on('webrtc:offer', (offer) => {
      emitToPartner('webrtc:offer', offer);
    });

    socket.on('webrtc:answer', (answer) => {
      emitToPartner('webrtc:answer', answer);
    });

    socket.on('webrtc:ice-candidate', (candidate) => {
      emitToPartner('webrtc:ice-candidate', candidate);
    });

  });

  return io;
}
