import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 优化构建输出
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
  },
  // 缓存策略
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    exclude: [],
  },
})