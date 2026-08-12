import React from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SearchChatModal: React.FC = () => {
  const { activeDrawer, setActiveDrawer, searchQuery, setSearchQuery, messages } = useApp();

  if (activeDrawer !== 'search') return null;

  const matches = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0 font-mono">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#a0a0a0]" /> // SEARCH CHAT
        </h3>
        <button
          onClick={() => {
            setActiveDrawer('none');
            setSearchQuery('');
          }}
          className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords..."
            className="w-full bg-[#101010] border border-[#1C1C1C] rounded pl-8 pr-8 py-2 text-xs text-[#f2f2f2] placeholder-[#666666] focus:outline-none focus:border-[#666666]"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#666666] hover:text-[#f2f2f2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-2">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-8 text-[#666666] text-xs">
              Type to search conversation messages.
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-[#666666] text-xs">
              No matching messages found for "{searchQuery}"
            </div>
          ) : (
            matches.map((msg) => (
              <div
                key={msg.id}
                className="p-2.5 rounded bg-[#101010] border border-[#1C1C1C] hover:border-[#666666] transition-colors flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] text-[#666666]">
                  <span className="font-semibold text-[#a0a0a0]">
                    {msg.isSelf ? 'YOU' : 'PARTNER'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-xs text-[#f2f2f2] leading-relaxed font-sans">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
