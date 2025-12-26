
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface AISettings {
  model: string;
  apiKey: string;
  baseUrl: string;
  contextLength: number;
}

export interface InterfaceSettings {
  uiOpacity: number;    // 面板透明度 (左栏 + 右栏主背景)
  compOpacity: number;  // 元素透明度 (气泡 + 输入框 + 卡片)
  wallpaper: string | null;
  uiGlassType: 'frosted' | 'clear'; // 全局玻璃类型
}

export enum SettingsTab {
  INTERFACE = 'INTERFACE',
  AI = 'AI'
}
