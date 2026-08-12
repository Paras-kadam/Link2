import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IFileMetadata extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  messageId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileMetadataSchema = new Schema<IFileMetadata>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  {
    timestamps: true,
  }
);

fileMetadataSchema.index({ conversationId: 1, createdAt: -1 });

export const FileMetadata = mongoose.model<IFileMetadata>('FileMetadata', fileMetadataSchema);
