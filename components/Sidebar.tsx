
import React from 'react';
import { Chat, InterfaceSettings } from '../types';

interface SidebarProps {
  isOpen: boolean;
  width: number;
  interfaceSettings: InterfaceSettings;
  onClose: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, width, interfaceSettings, onClose, chats, activeChatId, onChatSelect, onNewChat, onDeleteChat, onOpenSettings
}) => {
  const isFrosted = interfaceSettings.uiGlassType === 'frosted';
  const panelOpacity = interfaceSettings.uiOpacity;
  const elementOpacity = interfaceSettings.compOpacity;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-[40] md:hidden" onClick={onClose} />}
      <aside 
        style={{ 
          width: isOpen ? `${width}px` : '0px',
          backgroundColor: `rgba(255, 255, 255, ${panelOpacity})`,
          backdropFilter: isFrosted ? 'blur(40px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isFrosted ? 'blur(40px) saturate(180%)' : 'none',
        }}
        className={`fixed md:relative z-[50] h-full overflow-hidden shadow-2xl md:shadow-lg rounded-[40px] border border-white/40 flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent truncate">Tong AI</h1>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100/50 rounded-2xl transition-colors"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
        </div>

        <div className="px-6 mb-6">
          <button onClick={onNewChat} className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-bold shadow-xl shadow-blue-500/20 active:scale-[0.97] transition-all truncate hover:bg-blue-700">开启新对话</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          {chats.map(chat => (
            <div 
              key={chat.id} onClick={() => onChatSelect(chat.id)}
              style={{ 
                backgroundColor: activeChatId === chat.id ? 'rgba(37, 99, 235, 1)' : `rgba(255, 255, 255, ${elementOpacity})`,
                border: activeChatId === chat.id ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                // 对话项始终保持模糊感
                backdropFilter: activeChatId !== chat.id ? 'blur(15px)' : 'none',
                WebkitBackdropFilter: activeChatId !== chat.id ? 'blur(15px)' : 'none',
              }}
              className={`group flex items-center gap-3 px-5 py-4 rounded-[22px] cursor-pointer transition-all ${activeChatId === chat.id ? 'text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 shadow-sm hover:translate-x-1'}`}
            >
              <span className="truncate text-sm font-bold flex-1">{chat.title}</span>
              <button onClick={(e) => (e.stopPropagation(), onDeleteChat(chat.id))} className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${activeChatId === chat.id ? 'hover:bg-white/20' : 'hover:bg-red-50 text-red-400'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          ))}
        </div>

        <div className="p-6 mt-auto">
          <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-5 py-4 rounded-[22px] text-gray-600 hover:bg-gray-100/40 text-sm font-black border border-transparent transition-all active:scale-95">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            系统设置
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
