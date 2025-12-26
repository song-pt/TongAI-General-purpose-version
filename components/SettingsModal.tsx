
import React, { useState, useRef, useEffect } from 'react';
import { AISettings, InterfaceSettings, SettingsTab } from '../types';

interface SettingsModalProps {
  settings: AISettings;
  interfaceSettings: InterfaceSettings;
  onSave: (settings: AISettings, interfaceSettings: InterfaceSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  interfaceSettings,
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.INTERFACE);
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [localInterface, setLocalInterface] = useState<InterfaceSettings>(interfaceSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateInterface = (updates: Partial<InterfaceSettings>) => {
    const next = { ...localInterface, ...updates };
    setLocalInterface(next);
    onSave(localSettings, next);
  };

  const handleAISave = () => {
    onSave(localSettings, localInterface);
    onClose();
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInterface({ wallpaper: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">系统设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 flex-shrink-0">
          {Object.values(SettingsTab).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as SettingsTab)}
              className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === tab ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === SettingsTab.INTERFACE ? '界面设置' : 'AI 设置'}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === SettingsTab.INTERFACE ? (
            <>
              {/* 全局玻璃特效开关 */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">玻璃特效模式</label>
                <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
                  <button 
                    onClick={() => updateInterface({ uiGlassType: 'frosted' })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${localInterface.uiGlassType === 'frosted' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    毛玻璃 (模糊)
                  </button>
                  <button 
                    onClick={() => updateInterface({ uiGlassType: 'clear' })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${localInterface.uiGlassType === 'clear' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    透明 (无模糊)
                  </button>
                </div>
              </div>

              {/* 核心滑块：面板 + 元素 */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">面板透明度 (左右主背景)</label>
                    <span className="text-[10px] font-black text-blue-600">{(localInterface.uiOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={localInterface.uiOpacity}
                    onChange={(e) => updateInterface({ uiOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">元素透明度 (气泡/输入框/卡片)</label>
                    <span className="text-[10px] font-black text-blue-600">{(localInterface.compOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={localInterface.compOpacity}
                    onChange={(e) => updateInterface({ compOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* 壁纸 */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">环境背景</label>
                <div 
                  className="w-full h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-all overflow-hidden relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {localInterface.wallpaper ? (
                    <img src={localInterface.wallpaper} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold text-gray-400">点击上传壁纸</span>
                    </div>
                  )}
                </div>
                {localInterface.wallpaper && (
                  <button 
                    onClick={() => updateInterface({ wallpaper: null })} 
                    className="w-full py-2 text-[10px] font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    清除背景
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleWallpaperUpload} />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {[
                { label: '模型名称 (Model)', field: 'model', placeholder: '如: gpt-4o' },
                { label: 'API 密钥 (API Key)', field: 'apiKey', placeholder: 'sk-...' },
                { label: '接口地址 (Base URL)', field: 'baseUrl', placeholder: 'https://api.openai.com/v1' }
              ].map(item => (
                <div key={item.field} className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">{item.label}</label>
                  <input 
                    type={item.field === 'apiKey' ? 'password' : 'text'}
                    placeholder={item.placeholder}
                    value={(localSettings as any)[item.field]}
                    onChange={(e) => setLocalSettings({...localSettings, [item.field]: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              ))}
              <div className="pt-4">
                <button onClick={handleAISave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">保存 AI 配置并返回</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 justify-end border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="px-10 py-2.5 text-sm font-bold bg-gray-800 text-white rounded-xl shadow-lg active:scale-95 transition-all">完成退出</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
