import React, { useState } from 'react';
import { Image as ImageIcon, FileText, Mic, Star, X, Download, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SharedMediaDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, messages, setActiveLightboxImage, showToast } = useApp();
  const [tab, setTab] = useState<'all' | 'images' | 'videos' | 'audio' | 'documents'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (activeDrawer !== 'media') return null;

  const validMessages = messages.filter((m) => !m.isDeleted);
  const imageMsgs = validMessages.filter((m) => m.type === 'image' && m.mediaUrl);
  const videoMsgs = validMessages.filter((m) => m.type === 'video' && m.mediaUrl);
  const audioMsgs = validMessages.filter((m) => m.type === 'voice');
  const docMsgs = validMessages.filter((m) => m.type === 'file');

  const allMedia = [...imageMsgs, ...videoMsgs, ...audioMsgs, ...docMsgs];

  const getFilteredMessages = () => {
    let list: typeof allMedia = [];
    if (tab === 'all') list = allMedia;
    if (tab === 'images') list = imageMsgs;
    if (tab === 'videos') list = videoMsgs;
    if (tab === 'audio') list = audioMsgs;
    if (tab === 'documents') list = docMsgs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => 
        (m.fileName && m.fileName.toLowerCase().includes(q)) || 
        (m.content && m.content.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const displayedMedia = getFilteredMessages();

  return (
    <div className="w-full md:w-80 lg:w-[320px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-hidden shrink-0">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C] shrink-0">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#a0a0a0]" /> // MEDIA VAULT
        </h3>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Field */}
      <div className="p-2 border-b border-[#1C1C1C] bg-[#050505]">
        <input 
          type="text"
          placeholder="Search by filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#101010] border border-[#1C1C1C] rounded px-3 py-1.5 text-xs font-mono text-[#f2f2f2] placeholder-[#666666] focus:outline-none focus:border-[#666666]"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center p-2 border-b border-[#1C1C1C] bg-[#050505] text-[10px] font-mono gap-1 shrink-0">
        {['all', 'images', 'videos', 'audio', 'documents'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-2 py-1.5 rounded border transition-colors uppercase ${
              tab === t
                ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
                : 'text-[#666666] hover:text-[#a0a0a0] border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {displayedMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <span className="text-[#a0a0a0] text-xs font-bold font-mono">NO MEDIA YET</span>
            <span className="text-[#666666] text-[10px] font-mono px-4">Files shared between you and your partner will appear here.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayedMedia.map((msg) => {
              if (msg.type === 'image') {
                return (
                  <div
                    key={msg.id}
                    onClick={() => msg.mediaUrl && setActiveLightboxImage(msg.mediaUrl)}
                    className="relative group rounded border border-[#1C1C1C] aspect-square cursor-pointer overflow-hidden bg-[#050505]"
                  >
                    <img
                      src={msg.mediaUrl}
                      alt="Vault Media"
                      crossOrigin="use-credentials"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#f2f2f2]">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                );
              }
              if (msg.type === 'video') {
                return (
                  <div
                    key={msg.id}
                    className="relative rounded border border-[#1C1C1C] aspect-square overflow-hidden bg-[#050505] col-span-2 md:col-span-1 flex items-center justify-center"
                  >
                    <video src={msg.mediaUrl} className="w-full h-full object-cover" crossOrigin="use-credentials" controls preload="metadata" />
                  </div>
                );
              }
              if (msg.type === 'file' || msg.type === 'voice') {
                const isAudio = msg.type === 'voice';
                const Icon = isAudio ? Mic : FileText;
                return (
                  <div
                    key={msg.id}
                    className="col-span-2 p-2.5 rounded bg-[#101010] border border-[#1C1C1C] flex items-center gap-2.5 font-mono text-xs"
                  >
                    <Icon className="w-4 h-4 text-[#666666] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="truncate text-[#f2f2f2] font-medium">{msg.fileName || msg.content || (isAudio ? 'Audio Note' : 'Document')}</h5>
                      <span className="text-[10px] text-[#666666]">{msg.fileSize || (isAudio ? msg.audioDuration : 'Unknown Size')}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {msg.mediaUrl && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 mr-1 bg-[#151515] hover:bg-[#202020] border border-[#262626] rounded text-[#a0a0a0] hover:text-[#f2f2f2] text-[10px] font-bold tracking-wider transition-colors"
                        >
                          OPEN
                        </a>
                      )}
                      {msg.mediaUrl && (
                        <a
                          href={msg.mediaUrl}
                          download={msg.fileName || 'download'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#666666] hover:text-[#f2f2f2]"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
