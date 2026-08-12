import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (val: Types.ObjectId[]) => val.length === 2,
        message: 'A conversation must have exactly 2 participants.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index on participants for fast lookup
conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
