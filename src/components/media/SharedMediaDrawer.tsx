import React, { useState } from 'react';
import { Image as ImageIcon, FileText, Mic, Star, X, Download, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SharedMediaDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, messages, setActiveLightboxImage, showToast } = useApp();
  const [tab, setTab] = useState<'media' | 'docs' | 'voice' | 'starred'>('media');

  if (activeDrawer !== 'media') return null;

  const imageMessages = messages.filter((m) => m.type === 'image' && m.mediaUrl);
  const docMessages = messages.filter((m) => m.type === 'file');
  const voiceMessages = messages.filter((m) => m.type === 'voice');
  const starredMessages = messages.filter((m) => m.isStarred);

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
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

      {/* Tabs */}
      <div className="flex items-center p-2 border-b border-[#1C1C1C] bg-[#050505] text-[11px] font-mono gap-1">
        <button
          onClick={() => setTab('media')}
          className={`flex-1 py-1.5 rounded border transition-colors ${
            tab === 'media'
              ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
              : 'text-[#666666] hover:text-[#a0a0a0] border-transparent'
          }`}
        >
          MEDIA ({imageMessages.length})
        </button>
        <button
          onClick={() => setTab('docs')}
          className={`flex-1 py-1.5 rounded border transition-colors ${
            tab === 'docs'
              ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
              : 'text-[#666666] hover:text-[#a0a0a0] border-transparent'
          }`}
        >
          DOCS ({docMessages.length})
        </button>
        <button
          onClick={() => setTab('voice')}
          className={`flex-1 py-1.5 rounded border transition-colors ${
            tab === 'voice'
              ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
              : 'text-[#666666] hover:text-[#a0a0a0] border-transparent'
          }`}
        >
          AUDIO ({voiceMessages.length})
        </button>
        <button
          onClick={() => setTab('starred')}
          className={`flex-1 py-1.5 rounded border transition-colors ${
            tab === 'starred'
              ? 'bg-[#161616] text-[#f2f2f2] border-[#262626]'
              : 'text-[#666666] hover:text-[#a0a0a0] border-transparent'
          }`}
        >
          STARRED
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {tab === 'media' && (
          <div className="grid grid-cols-2 gap-2">
            {imageMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => msg.mediaUrl && setActiveLightboxImage(msg.mediaUrl)}
                className="relative group rounded border border-[#1C1C1C] aspect-square cursor-pointer overflow-hidden bg-[#050505]"
              >
                <img
                  src={msg.mediaUrl}
                  alt="Vault Media"
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#f2f2f2]">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'docs' && (
          <div className="space-y-2">
            {docMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-2.5 rounded bg-[#101010] border border-[#1C1C1C] flex items-center gap-2.5 font-mono text-xs"
              >
                <FileText className="w-4 h-4 text-[#666666] shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="truncate text-[#f2f2f2] font-medium">{msg.fileName || msg.content}</h5>
                  <span className="text-[10px] text-[#666666]">{msg.fileSize || '3.2 MB'} • {msg.timestamp}</span>
                </div>
                <button
                  onClick={() => showToast('Downloading Document', `Saved ${msg.fileName}`, 'info')}
                  className="p-1.5 text-[#666666] hover:text-[#f2f2f2]"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'voice' && (
          <div className="space-y-2 font-mono text-xs">
            {voiceMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-2.5 rounded bg-[#101010] border border-[#1C1C1C] flex items-center gap-2.5"
              >
                <Mic className="w-4 h-4 text-[#666666] shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-[#f2f2f2]">Voice Note ({msg.audioDuration || '0:18'})</h5>
                  <span className="text-[10px] text-[#666666]">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'starred' && (
          <div className="space-y-2">
            {starredMessages.length === 0 ? (
              <p className="text-xs font-mono text-[#666666] text-center py-6">No starred messages.</p>
            ) : (
              starredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-2.5 rounded bg-[#101010] border border-[#1C1C1C] flex items-start gap-2 text-xs"
                >
                  <Star className="w-3.5 h-3.5 text-[#a0a0a0] fill-[#a0a0a0] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[#f2f2f2]">{msg.content}</p>
                    <span className="text-[10px] font-mono text-[#666666] mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
