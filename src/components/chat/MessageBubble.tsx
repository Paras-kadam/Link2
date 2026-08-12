import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  FileText,
  Download,
  Pin,
  Star,
  Reply,
  Trash2,
  Copy,
  Smile,
  Phone,
  Video,
  Shield,
  Maximize2,
} from 'lucide-react';
import type { Message } from '../../types';
import { useApp } from '../../context/AppContext';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const {
    currentUser,
    deleteMessage,
    togglePinMessage,
    toggleStarMessage,
    addReaction,
    setActiveLightboxImage,
    setReplyingTo,
    showToast,
  } = useApp();

  const isSelf = currentUser && (message.senderId === currentUser.id || message.isSelf);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<'1.0x' | '1.5x' | '2.0x'>('1.0x');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = ['❤️', '👍', '🔥', '😂', '🔐', '✨'];

  // System Message render
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="bg-[#0A0A0A] px-3 py-1 rounded border border-[#1C1C1C] text-[#a0a0a0] text-[11px] font-mono flex items-center gap-2">
          <Shield className="w-3 h-3 text-[#666666]" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  // Call Log Message render
  if (message.type === 'call_log') {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="bg-[#0A0A0A] px-3 py-2 rounded border border-[#1C1C1C] text-[#a0a0a0] text-xs font-mono flex items-center gap-2.5">
          {message.content.includes('Video') ? (
            <Video className="w-4 h-4 text-[#666666]" />
          ) : (
            <Phone className="w-4 h-4 text-[#666666]" />
          )}
          <div>
            <p className="font-semibold text-[#f2f2f2]">{message.content}</p>
            <span className="text-[10px] text-[#666666]">{message.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    showToast('Copied to Clipboard', 'Message content copied.', 'info');
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div
      className={`group relative flex flex-col my-1.5 max-w-[85%] md:max-w-[65%] ${
        isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      {/* Context Actions bar on Hover */}
      <div
        className={`absolute -top-3 ${
          isSelf ? 'right-2' : 'left-2'
        } opacity-0 group-hover:opacity-100 transition-all duration-150 z-20 flex items-center gap-0.5 bg-[#0A0A0A] border border-[#1C1C1C] rounded px-1.5 py-0.5 shadow-md`}
      >
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] rounded transition-colors"
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setReplyingTo(message)}
          className="p-1 text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] rounded transition-colors"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => togglePinMessage(message.id)}
          className={`p-1 rounded transition-colors ${
            message.isPinned ? 'text-[#f2f2f2] bg-[#161616]' : 'text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Pin Message"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => toggleStarMessage(message.id)}
          className={`p-1 rounded transition-colors ${
            message.isStarred ? 'text-[#f2f2f2] bg-[#161616]' : 'text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Star Message"
        >
          <Star className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1 text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] rounded transition-colors"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => deleteMessage(message.id)}
          className="p-1 text-[#666666] hover:text-rose-400 hover:bg-[#151515] rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          className={`absolute -top-10 ${
            isSelf ? 'right-0' : 'left-0'
          } z-30 flex items-center gap-1 bg-[#0A0A0A] border border-[#1C1C1C] p-1.5 rounded shadow-lg`}
        >
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                addReaction(message.id, emoji);
                setShowEmojiPicker(false);
              }}
              className="text-sm p-1 hover:bg-[#151515] rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Pinned or Starred Indicators */}
      {(message.isPinned || message.isStarred) && (
        <div className="flex items-center gap-2 mb-0.5 px-1 text-[10px] font-mono text-[#666666]">
          {message.isPinned && (
            <span className="flex items-center gap-1 text-[#a0a0a0]">
              <Pin className="w-3 h-3" /> pinned
            </span>
          )}
          {message.isStarred && (
            <span className="flex items-center gap-1 text-[#a0a0a0]">
              <Star className="w-3 h-3" /> starred
            </span>
          )}
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`relative p-3 rounded-lg border text-xs md:text-sm leading-relaxed transition-colors ${
          isSelf
            ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
            : 'bg-[#0D0D0D] text-[#f2f2f2] border-[#1C1C1C]'
        }`}
      >
        {/* Reply Preview */}
        {message.replyTo && (
          <div className="mb-2 p-2 rounded bg-[#050505] border-l-2 border-[#666666] text-xs">
            <span className="font-semibold block text-[10px] text-[#a0a0a0]">
              {message.replyTo.senderName}
            </span>
            <span className="truncate block text-[#666666] mt-0.5">{message.replyTo.content}</span>
          </div>
        )}

        {/* 1. Text Content */}
        {message.type === 'text' && (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* 2. Image Content */}
        {message.type === 'image' && (
          <div className="flex flex-col gap-2">
            {message.content && <p className="mb-1">{message.content}</p>}
            <div className="relative group/img overflow-hidden rounded border border-[#1C1C1C] max-w-sm bg-[#050505]">
              <img
                src={message.mediaUrl}
                alt="Shared Image"
                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => message.mediaUrl && setActiveLightboxImage(message.mediaUrl)}
              />
              <button
                onClick={() => message.mediaUrl && setActiveLightboxImage(message.mediaUrl)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#f2f2f2] text-xs font-mono"
              >
                <Maximize2 className="w-4 h-4" /> VIEW PHOTO
              </button>
            </div>
          </div>
        )}

        {/* 3. Voice Note Content */}
        {message.type === 'voice' && (
          <div className="flex items-center gap-3 min-w-[200px] py-1">
            <button
              onClick={toggleAudio}
              className="p-2 rounded bg-[#101010] hover:bg-[#151515] border border-[#1C1C1C] text-[#f2f2f2] transition-colors"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-1 h-4">
                {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30, 80, 50, 90].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: isPlayingAudio ? `${Math.random() * 80 + 20}%` : `${h}%` }}
                    className="w-1 rounded-full bg-[#666666] transition-all duration-300"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
                <span>{message.audioDuration || '0:18'}</span>
                <button
                  onClick={() =>
                    setAudioSpeed((prev) => (prev === '1.0x' ? '1.5x' : prev === '1.5x' ? '2.0x' : '1.0x'))
                  }
                  className="px-1 bg-[#0A0A0A] rounded border border-[#1C1C1C]"
                >
                  {audioSpeed}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. File Attachment Content */}
        {message.type === 'file' && (
          <div className="flex items-center gap-3 p-2 rounded bg-[#050505] border border-[#1C1C1C] max-w-xs">
            <FileText className="w-5 h-5 text-[#a0a0a0] shrink-0" />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-mono truncate text-[#f2f2f2]">
                {message.fileName || message.content}
              </h5>
              <span className="text-[10px] font-mono text-[#666666]">
                {message.fileSize || '2.4 MB'}
              </span>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                showToast('Downloading File', `Saved ${message.fileName || 'document'}`, 'info');
              }}
              className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#101010] transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Message Timestamp & Status Footer */}
        <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] font-mono text-[#666666] select-none">
          {message.isEdited && <span className="mr-1 italic">(edited)</span>}
          <span>{message.timestamp}</span>
          {isSelf && (
            <span>
              {message.status === 'read' ? (
                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-[#a0a0a0]" /></span>
              ) : message.status === 'delivered' ? (
                <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-[#666666]" /></span>
              ) : (
                <span title="Sent"><Check className="w-3.5 h-3.5 text-[#666666]" /></span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Emoji Reactions Badges */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div
          className={`flex items-center gap-1 mt-1 ${
            isSelf ? 'justify-end' : 'justify-start'
          }`}
        >
          {Object.entries(message.reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => addReaction(message.id, emoji)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono transition-colors ${
                users.includes(currentUser?.id || '')
                  ? 'bg-[#161616] border-[#666666] text-[#f2f2f2]'
                  : 'bg-[#0A0A0A] border-[#1C1C1C] text-[#a0a0a0]'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-[10px]">{users.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
