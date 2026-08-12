import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice';

export interface IAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface IReaction {
  userId: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: MessageType;
  attachments: IAttachment[];
  replyTo: Types.ObjectId | null;
  reactions: IReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const reactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'file', 'voice'],
      default: 'text',
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
