/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pptWeb/', // Set base path for GitHub Pages deployment
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts', // 更新 setupFiles 路径
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // 在 tests 目录下查找测试文件
    // 如果你的 CSS 文件或模块导致测试问题，可以添加 css: true
    // css: true,
  },
})
