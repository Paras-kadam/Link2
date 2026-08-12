import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Mic, Send, Image as ImageIcon, FileText, X, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceRecorderModal } from './VoiceRecorderModal';

export const MessageInput: React.FC = () => {
  const { sendMessage, replyingTo, setReplyingTo, showToast, setIsPartnerTyping, addMessage } = useApp();
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const emojiList = ['😊', '❤️', '🔥', '👍', '🔐', '✨', '🚀', '🎉', '💡', '😎', '💬', '🙌'];

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim(), 'text');
    setText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setIsPartnerTyping(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setUploadProgress(0);

    const tempId = `upload_${Date.now()}`;
    // Show a toast for progress instead of a fake message to avoid complex state management
    showToast('Uploading...', `Starting upload for ${file.name}`, 'info');
    
    try {
      const { message } = await import('../../services/fileService').then(m => 
        m.fileService.uploadFile(file, (progress) => {
          setUploadProgress(progress);
        })
      );
      
      const { messageService } = await import('../../services/messageService');
      const formatted = messageService.mapBackendMessageToFrontend(message);
      addMessage(formatted);
      showToast('Upload Complete', 'File successfully sent', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message, 'error');
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openFilePicker = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleAttachImage = () => openFilePicker('image/*');
  const handleAttachFile = () => openFilePicker('*/*');


  // Add the file input element in the render

  return (
    <div className="relative bg-[#0A0A0A] border-t border-[#1C1C1C] p-2.5 md:p-4 z-10 select-none pb-safe shrink-0">
      {/* Voice Recorder Overlay Trigger */}
      {showVoiceModal && <VoiceRecorderModal onClose={() => setShowVoiceModal(false)} />}

      {/* Replying To Banner */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded bg-[#101010] border border-[#1C1C1C] flex items-center justify-between text-xs font-mono">
          <div className="min-w-0 flex flex-col">
            <span className="text-[#a0a0a0] font-semibold">Replying to message</span>
            <span className="text-[#666666] truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-[#666666] hover:text-[#f2f2f2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Popovers */}
      {/* 1. Attachment Menu Popover */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-3 z-30 bg-[#0A0A0A] border border-[#1C1C1C] p-1.5 rounded shadow-xl flex flex-col gap-1 w-52 font-mono text-xs">
          <button
            onClick={handleAttachImage}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#151515] text-[#a0a0a0] hover:text-[#f2f2f2] transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-[#666666]" />
            <span>SEND PHOTO</span>
          </button>

          <button
            onClick={() => openFilePicker('video/*')}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#151515] text-[#a0a0a0] hover:text-[#f2f2f2] transition-colors text-left"
          >
            <Video className="w-4 h-4 text-[#666666]" />
            <span>SEND VIDEO</span>
          </button>

          <button
            onClick={handleAttachFile}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#151515] text-[#a0a0a0] hover:text-[#f2f2f2] transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-[#666666]" />
            <span>SEND DOCUMENT</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false);
              setShowVoiceModal(true);
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#151515] text-[#a0a0a0] hover:text-[#f2f2f2] transition-colors text-left"
          >
            <Mic className="w-4 h-4 text-[#666666]" />
            <span>RECORD VOICE NOTE</span>
          </button>
        </div>
      )}

      {/* 2. Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-12 z-30 bg-[#0A0A0A] border border-[#1C1C1C] p-2 rounded shadow-xl grid grid-cols-6 gap-1 max-w-xs">
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg p-2 rounded hover:bg-[#151515] transition-colors text-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />
      
      <div className="flex items-end gap-2">
        {/* Attach Button */}
        <button
          onClick={() => {
            setShowAttachMenu(!showAttachMenu);
            setShowEmojiPicker(false);
          }}
          className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded flex items-center justify-center border transition-colors ${
            showAttachMenu
              ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
              : 'bg-[#101010] text-[#a0a0a0] border-[#1C1C1C] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Attach File"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input Field */}
        <div className="flex-1 bg-[#101010] border border-[#1C1C1C] rounded flex items-end gap-1.5 focus-within:border-[#666666] transition-colors min-h-[44px] px-2 py-1.5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              if (e.target.value.trim() !== '') {
                setIsPartnerTyping(true); // this actually emits my typing via context mapping
              } else {
                setIsPartnerTyping(false);
              }
            }}
            onBlur={() => setIsPartnerTyping(false)}
            onKeyDown={handleKeyDown}
            placeholder="Type message..."
            rows={1}
            className="w-full bg-transparent text-[#f2f2f2] placeholder-[#666666] text-xs md:text-sm focus:outline-none resize-none px-1 py-1 max-h-32"
          />

          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className="p-1.5 text-[#666666] hover:text-[#f2f2f2] transition-colors"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send or Voice Record Button */}
        {uploadProgress !== null ? (
          <div className="w-11 h-11 min-h-[44px] min-w-[44px] rounded bg-[#161616] border border-[#262626] text-[#666666] flex flex-col items-center justify-center text-[8px] font-mono shrink-0">
            <span>{uploadProgress}%</span>
          </div>
        ) : text.trim() ? (
          <button
            onClick={handleSend}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded bg-[#161616] hover:bg-[#151515] border border-[#262626] text-[#f2f2f2] flex items-center justify-center transition-colors shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowVoiceModal(true)}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded bg-[#101010] hover:bg-[#151515] border border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2] flex items-center justify-center transition-colors shrink-0"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
