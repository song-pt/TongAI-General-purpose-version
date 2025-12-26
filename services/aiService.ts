import { GoogleGenAI } from "@google/genai";
import { Message, AISettings } from "../types";

export const callAI = async (
  messages: Message[],
  settings: AISettings,
  systemPrompt: string
): Promise<string> => {
  const isUserConfigured = settings.apiKey && settings.baseUrl && settings.model;
  const hasSystemKey = !!process.env.API_KEY;

  // 根据设置的上下文长度裁剪消息 (保留最近的 N 条消息)
  const contextLimit = settings.contextLength || 10;
  const historyMessages = messages.slice(-contextLimit);

  // 预处理消息：将预设提示词拼接在每一条用户消息的前面
  const processedMessages = historyMessages.map(msg => {
    if (msg.role === 'user') {
      return {
        ...msg,
        content: (systemPrompt || "") + msg.content
      };
    }
    return msg;
  });

  // 情况 A: 用户已经配置了自己的 OpenAI 兼容 API
  if (isUserConfigured) {
    try {
      let baseUrl = settings.baseUrl.trim().replace(/\/$/, '');
      
      // 自动修正 OpenRouter 等常见地址格式
      if (baseUrl.includes('openrouter.ai') && !baseUrl.includes('/api')) {
        baseUrl = baseUrl.replace('openrouter.ai', 'openrouter.ai/api');
      }

      let finalUrl = baseUrl;
      if (!finalUrl.endsWith('/chat/completions')) {
        if (finalUrl.endsWith('/v1')) {
          finalUrl += '/chat/completions';
        } else {
          finalUrl += '/v1/chat/completions';
        }
      }

      finalUrl = finalUrl.replace(/([^:]\/)\/+/g, "$1");

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Tong AI Chat',
        },
        body: JSON.stringify({
          model: settings.model.trim(),
          messages: processedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `服务器错误: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "API 未返回内容。";
    } catch (error: any) {
      console.error("User API Error:", error);
      throw error;
    }
  } 
  
  // 情况 B: 用户未配置，但在 Google Studio 预览环境下 (存在系统 Key)
  if (hasSystemKey) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = 'gemini-3-flash-preview';
    
    const contents = processedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });
      return response.text || "No response generated.";
    } catch (error: any) {
      console.error("Gemini Fallback Error:", error);
      throw new Error(`预览模式调用失败: ${error.message}`);
    }
  }

  // 情况 C: 既没有用户配置，也没有系统 Key (例如在 Vercel 上直接访问)
  throw new Error("AI 未配置：请点击左下角「系统设置」填写您的 API Key、Base URL 和模型名称。");
};