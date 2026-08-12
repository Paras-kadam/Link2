import type { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const messageService = {
  async getMessageHistory(cursor?: string): Promise<{ messages: any[]; nextCursor: string | null }> {
    const url = new URL(`${API_URL}/messages`);
    url.searchParams.append('limit', '50');
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch messages');
    }
    
    return {
      messages: data.data.messages.map(this.mapBackendMessageToFrontend),
      nextCursor: data.data.nextCursor
    };
  },

  mapBackendMessageToFrontend(msg: any): Message {
    return {
      id: msg._id,
      senderId: msg.senderId,
      recipientId: msg.senderId, // mock recipient id since it's 2 user only
      content: msg.content,
      type: msg.messageType,
      mediaUrl: msg.attachments?.[0]?.url,
      fileName: msg.attachments?.[0]?.name,
      fileSize: msg.attachments?.[0]?.size ? `${(msg.attachments[0].size / 1024 / 1024).toFixed(1)} MB` : undefined,
      replyTo: msg.replyTo ? {
        id: msg.replyTo._id,
        senderName: 'User',
        content: msg.replyTo.content
      } : undefined,
      reactions: msg.reactions?.reduce((acc: any, r: any) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r.userId);
        return acc;
      }, {}) || {},
      status: msg.status || 'sent',
      isEdited: msg.isEdited,
      isPinned: false,
      isStarred: false,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
};
