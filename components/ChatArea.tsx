
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chat, InterfaceSettings } from '../types';

interface ChatAreaProps {
  activeChat: Chat | null;
  interfaceSettings: InterfaceSettings;
  onSendMessage: (text: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (val: string) => void;
  isLoading: boolean;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  interfaceSettings,
  onSendMessage,
  systemPrompt,
  onSystemPromptChange,
  isLoading,
  toggleSidebar,
  isSidebarOpen
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    if (systemPromptRef.current) {
      systemPromptRef.current.style.height = 'auto';
      systemPromptRef.current.style.height = `${systemPromptRef.current.scrollHeight}px`;
    }
  }, [inputText, systemPrompt]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const isFrosted = interfaceSettings.uiGlassType === 'frosted';
  const panelOpacity = interfaceSettings.uiOpacity;
  const elementOpacity = interfaceSettings.compOpacity;

  // 主容器面板背景：遵循用户选择的“透明/毛玻璃”切换
  const mainBgStyle: React.CSSProperties = {
    backgroundColor: `rgba(255, 255, 255, ${panelOpacity})`,
    backdropFilter: isFrosted ? 'blur(40px) saturate(180%)' : 'none',
    WebkitBackdropFilter: isFrosted ? 'blur(40px) saturate(180%)' : 'none',
    transition: 'background-color 0.2s ease, backdrop-filter 0.3s ease',
  };

  // 核心组件元素背景：始终保持 25px 模糊，无论全局设置如何
  const elementBgStyle: React.CSSProperties = {
    backgroundColor: `rgba(255, 255, 255, ${elementOpacity})`,
    // 强制开启模糊，确保“后面的文字是模糊的”
    backdropFilter: 'blur(25px) saturate(160%)',
    WebkitBackdropFilter: 'blur(25px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  };

  return (
    <div className="relative flex flex-col h-full rounded-[48px] shadow-2xl border border-white/40 overflow-hidden bg-transparent">
      
      {/* 面板主背景层 */}
      <div 
        className="absolute inset-0 -z-10 pointer-events-none"
        style={mainBgStyle}
      />

      <header className="px-8 py-5 flex items-center justify-between z-30 border-b border-white/20">
        <div className="flex items-center gap-4">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="p-2.5 hover:bg-white/30 rounded-2xl transition-all">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <h2 className="font-extrabold text-gray-900 tracking-tight text-lg">{activeChat?.title || '新对话'}</h2>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar z-10 scroll-smooth">
          <div className="flex-shrink-0 h-48"></div> 
          
          <div className="px-8 py-6 space-y-10 flex-1">
            {activeChat?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div 
                  style={{ 
                    backgroundColor: msg.role === 'user' ? 'rgba(37, 99, 235, 0.9)' : `rgba(255, 255, 255, ${elementOpacity})`,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    // 气泡即便在“透明面板”下，自身也保持模糊感
                    backdropFilter: msg.role !== 'user' ? 'blur(15px)' : 'none',
                    WebkitBackdropFilter: msg.role !== 'user' ? 'blur(15px)' : 'none',
                  }}
                  className={`max-w-[85%] rounded-[28px] px-6 py-4 shadow-sm ${msg.role === 'user' ? 'text-white rounded-tr-none' : 'text-gray-900 rounded-tl-none'}`}
                >
                  <div className="markdown-content text-[15.5px] font-medium leading-relaxed tracking-tight">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in">
                <div 
                  style={elementBgStyle}
                  className="rounded-[24px] rounded-tl-none px-6 py-4 flex items-center gap-3 shadow-md"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 h-44"></div> 
        </div>

        {/* 悬浮预设词卡片：始终毛玻璃 */}
        <div className="absolute top-4 inset-x-0 z-50 px-8 pointer-events-none">
          <div 
            style={elementBgStyle}
            className="p-5 rounded-[36px] pointer-events-auto shadow-xl"
          >
            <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] pl-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              自动拼接预设
            </div>
            <div className="bg-white/10 border border-white/5 rounded-[22px] px-5 py-0.5 focus-within:bg-white/30 transition-all duration-300">
              <textarea 
                ref={systemPromptRef} rows={1} value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                placeholder="在此输入预设词..."
                className="w-full bg-transparent py-3 text-sm outline-none text-gray-800 resize-none overflow-hidden font-semibold placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* 悬浮底部输入框：始终毛玻璃 */}
        <div className="absolute bottom-0 inset-x-0 z-50 p-8 pointer-events-none">
          <div 
            style={elementBgStyle}
            className="max-w-4xl mx-auto flex items-center gap-3 p-2.5 pl-8 rounded-[40px] pointer-events-auto shadow-2xl transition-all duration-300"
          >
            <textarea
              ref={textareaRef} rows={1} value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="发送消息..."
              className="flex-1 bg-transparent py-4 text-[16px] outline-none resize-none max-h-48 text-gray-900 leading-relaxed font-semibold placeholder:text-gray-500"
            />
            
            <button 
              onClick={handleSend} disabled={!inputText.trim() || isLoading}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading 
                ? 'bg-blue-600 text-white shadow-lg scale-100 hover:scale-105 active:scale-90' 
                : 'bg-white/5 text-gray-400'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatArea;
