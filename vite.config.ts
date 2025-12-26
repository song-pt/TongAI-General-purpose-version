
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 确保浏览器环境可以访问 process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
