/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'; // Import fs module
import path from 'path'; // Import path module

// Read package.json to get the version
const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const appVersion = packageJson.version;

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Define the environment variable, ensuring it's properly stringified
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  },
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
