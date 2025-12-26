
import React, { useState, useRef, useEffect } from 'react';
import { InterfaceSettings } from '../types';

interface PresetModalProps {
  systemPrompt: string;
  onSave: (val: string) => void;
  onClose: () => void;
  interfaceSettings: InterfaceSettings;
}

const PresetModal: React.FC<PresetModalProps> = ({
  systemPrompt,
  onSave,
  onClose,
  interfaceSettings
}) => {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localPrompt]);

  const handleSave = () => {
    onSave(localPrompt);
    onClose();
  };

  const isFrosted = interfaceSettings.uiGlassType === 'frosted';
  const elementOpacity = interfaceSettings.compOpacity;

  const modalStyle: React.CSSProperties = {
    backgroundColor: `rgba(255, 255, 255, ${elementOpacity})`,
    backdropFilter: 'blur(25px) saturate(160%)',
    WebkitBackdropFilter: 'blur(25px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        style={modalStyle}
        className="relative w-full max-w-xl rounded-[40px] shadow-2xl p-8 animate-in"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">全局预设指令</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">这些内容将自动拼接到每条新消息前</p>
          </div>
        </div>

        <div className="bg-white/30 border border-white/40 rounded-[28px] p-6 focus-within:bg-white/50 transition-all">
          <textarea 
            ref={textareaRef}
            rows={4}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="例如：请使用中文回答我，语气要专业且简洁。"
            className="w-full bg-transparent outline-none text-gray-800 text-sm font-semibold placeholder:text-gray-400 resize-none max-h-60 overflow-y-auto custom-scrollbar"
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresetModal;
