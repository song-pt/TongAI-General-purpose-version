
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import PresetModal from './components/PresetModal';
import { Chat, Message, AISettings, InterfaceSettings } from './types';
import { callAI } from './services/aiService';

const App: React.FC = () => {
  const CHATS_KEY = 'nova_chats_v4';
  const SETTINGS_KEY = 'nova_settings_v4';
  const INTERFACE_KEY = 'nova_interface_v4';
  const SYSTEM_PROMPT_KEY = 'nova_system_prompt_v4';
  const ACTIVE_CHAT_ID_KEY = 'nova_active_chat_id_v4';
  const SIDEBAR_WIDTH_KEY = 'nova_sidebar_width_v4';

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(CHATS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_CHAT_ID_KEY);
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved) : 288;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem(SYSTEM_PROMPT_KEY) || "");
  
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : { 
        model: '', 
        apiKey: '', 
        baseUrl: 'https://api.openai.com/v1', 
        contextLength: 10 
      };
    } catch (e) {
      return { model: '', apiKey: '', baseUrl: 'https://api.openai.com/v1', contextLength: 10 };
    }
  });

  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(() => {
    try {
      const saved = localStorage.getItem(INTERFACE_KEY);
      const defaults: InterfaceSettings = { 
        uiOpacity: 0.8, 
        compOpacity: 0.5, 
        wallpaper: null, 
        uiGlassType: 'frosted'
      };
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
      return { uiOpacity: 0.8, compOpacity: 0.5, wallpaper: null, uiGlassType: 'frosted' };
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(INTERFACE_KEY, JSON.stringify(interfaceSettings)); }, [interfaceSettings]);
  useEffect(() => { localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);
  
  useEffect(() => {
    if (activeChatId) localStorage.setItem(ACTIVE_CHAT_ID_KEY, activeChatId);
    else localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
  }, [activeChatId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    let currentActiveId = activeChatId;
    let updatedChats = [...chats];
    if (!currentActiveId) {
      const newChat: Chat = { id: Date.now().toString(), title: text.slice(0, 30), messages: [], createdAt: Date.now() };
      updatedChats = [newChat, ...updatedChats];
      currentActiveId = newChat.id;
      setActiveChatId(newChat.id);
    }
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    const chatIndex = updatedChats.findIndex(c => c.id === currentActiveId);
    if (chatIndex === -1) return;
    const chatToUpdate = updatedChats[chatIndex];
    const newMessages = [...chatToUpdate.messages, userMsg];
    const nextChats = updatedChats.map(c => c.id === currentActiveId ? { ...c, messages: newMessages } : c);
    setChats(nextChats);
    setIsLoading(true);
    try {
      const aiResponse = await callAI(newMessages, settings, systemPrompt);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() };
      setChats(prev => prev.map(chat => chat.id === currentActiveId ? { ...chat, messages: [...chat.messages, aiMsg] } : chat));
    } catch (error: any) { alert(`调用 AI 出错: ${error.message}`); }
    finally { setIsLoading(false); }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans select-none">
      <div 
        className="fixed inset-0 -z-50 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: interfaceSettings.wallpaper ? `url(${interfaceSettings.wallpaper})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: interfaceSettings.wallpaper ? 'transparent' : '#f0f2f5',
        }}
      >
        {!interfaceSettings.wallpaper && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1]"></div>
        )}
      </div>

      <div className="relative z-10 h-full w-full p-2 md:p-4 flex gap-3 bg-transparent">
        <Sidebar 
          isOpen={isSidebarOpen}
          width={sidebarWidth}
          interfaceSettings={interfaceSettings}
          onClose={() => setIsSidebarOpen(false)}
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={setActiveChatId}
          onNewChat={() => {
            const newChat = { id: Date.now().toString(), title: '新对话', messages: [], createdAt: Date.now() };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
          }}
          onDeleteChat={(id) => setChats(prev => prev.filter(c => c.id !== id))}
          onRenameChat={handleRenameChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPreset={() => setIsPresetOpen(true)}
        />

        <main className="flex-1 h-full min-w-0 select-text">
          <ChatArea 
            activeChat={chats.find(c => c.id === activeChatId) || null}
            interfaceSettings={interfaceSettings}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </main>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings}
          interfaceSettings={interfaceSettings}
          onSave={(s, i) => { setSettings(s); setInterfaceSettings(i); }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isPresetOpen && (
        <PresetModal
          systemPrompt={systemPrompt}
          onSave={setSystemPrompt}
          onClose={() => setIsPresetOpen(false)}
          interfaceSettings={interfaceSettings}
        />
      )}
    </div>
  );
};

export default App;
