import React from 'react';
import { Bell, X, ShieldAlert, PhoneCall, MessageSquare, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    activeDrawer,
    setActiveDrawer,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  } = useApp();

  if (activeDrawer !== 'notifications') return null;

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0 font-mono">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#a0a0a0]" /> // NOTIFICATIONS
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={clearAllNotifications}
            className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
            title="Clear All Notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveDrawer('none')}
            className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-[#666666] text-xs">
            No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-2.5 rounded border transition-colors cursor-pointer flex items-start gap-2.5 ${
                notif.read
                  ? 'bg-[#050505] border-[#1C1C1C] text-[#666666]'
                  : 'bg-[#101010] border-[#262626] text-[#f2f2f2]'
              }`}
            >
              <div className="mt-0.5 text-[#a0a0a0]">
                {notif.type === 'call' ? (
                  <PhoneCall className="w-3.5 h-3.5" />
                ) : notif.type === 'security' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <h5 className="font-bold text-[#f2f2f2] truncate">{notif.title}</h5>
                  <span className="text-[10px] text-[#666666]">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-[#a0a0a0] mt-0.5 leading-relaxed font-sans">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
