import { z } from 'zod';
import { Types } from 'mongoose';

// Custom validator for MongoDB ObjectId
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createMessageSchema = z.object({
  conversationId: objectId,
  content: z.string().max(5000).optional(),
  messageType: z.enum(['text', 'image', 'video', 'file', 'voice']).default('text'),
  replyTo: objectId.optional(),
  
  // Future extensibility for attachments
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.string(),
        name: z.string(),
        size: z.number().positive(),
      })
    )
    .optional(),
}).refine(
  (data) => data.content || (data.attachments && data.attachments.length > 0),
  {
    message: 'Message must have content or attachments',
    path: ['content'],
  }
);

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
