# PPTWeb - 可视化 PowerPoint 编辑器

**[🚀 在线演示](https://thebiggavin.github.io/pptWeb/)**

[![React](https://img.shields.io/badge/React-^19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-^6.2.0-yellow?logo=vite)](https://vitejs.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-^11.11.4-orange)](https://reactflow.dev/)
[![PptxGenJS](https://img.shields.io/badge/PptxGenJS-^3.12.0-red)](https://gitbrent.github.io/PptxGenJS/)
[![Yarn](https://img.shields.io/badge/Yarn-^1.22.22-blue?logo=yarn)](https://yarnpkg.com/)
[![ESLint](https://img.shields.io/badge/ESLint-^9.21.0-purple?logo=eslint)](https://eslint.org/)

一个基于 Web 的可视化 PowerPoint 演示文稿编辑器，使用基于节点的界面进行创建。采用 React、TypeScript、Vite、React Flow 和 PptxGenJS 构建。

## ✨ 功能特性

- **可视化幻灯片编辑**: 使用基于节点的界面（由 React Flow 驱动）来添加、排列和可视化您的演示文稿幻灯片。
- **详细幻灯片属性**: 选中幻灯片节点，通过属性面板编辑其标题、选择布局（影响可用的内容区域），并最多可在四个不同的内容区域输入文本。
- **工具栏操作**:
  - 添加新幻灯片。
  - 使用 Dagre.js 自动排列幻灯片 (`自动布局`)。
  - 将当前演示文稿状态保存到浏览器本地存储 (`保存`)。
  - 从本地存储加载先前保存的状态 (`加载`)。
  - 使用 PptxGenJS 将可视化布局直接导出为 `.pptx` 文件 (`导出 PPTX`)。幻灯片按垂直位置排序。
  - 访问应用程序设置 (`设置` - 当前为占位符)。
- **PPTX 导出**: 将您的可视化布局直接导出为 `.pptx` 文件。幻灯片会根据其在编辑器中的垂直位置进行排序。属性面板中的布局和内容也会包含在内。
- **本地存储持久化**: 将您的工作保存在浏览器中，以便稍后重新加载。
- **自定义控件和小地图**: 通过缩放控件、节点聚焦和小地图概览增强画布导航。
- **现代化技术栈**: 使用 React 19、TypeScript 和 Vite 构建，提供快速的开发体验。

## 🛠️ 技术栈

- **前端框架**: [React](https://reactjs.org/) (^19.0.0)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/) (~5.7.2)
- **构建工具**: [Vite](https://vitejs.dev/) (^6.2.0)
- **节点化界面**: [React Flow](https://reactflow.dev/) (^11.11.4)
- **PPTX 生成**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (^3.12.0)
- **包管理器**: [Yarn](https://yarnpkg.com/) (^1.22.22)
- **代码检查**: [ESLint](https://eslint.org/) (^9.21.0)

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) (推荐使用 LTS 版本)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.x 版本)

### 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/theBigGavin/pptWeb.git
    cd pptweb
    ```
2.  使用 Yarn 安装依赖：
    ```bash
    yarn install
    ```

### 运行开发服务器

启动 Vite 开发服务器（支持热模块替换 HMR）：

```bash
yarn dev
```

在浏览器中打开命令行提示的 URL (通常是 `http://localhost:5173`)。

### 运行测试

使用 Vitest 运行单元测试：

```bash
yarn test
```

此命令将在监视模式下运行 `tests` 目录中的测试。

### 构建生产版本

创建优化后的生产版本：

```bash
yarn build
```

构建产物将生成在 `dist` 目录下。

### 预览生产版本

在本地预览生产版本：

```bash
yarn preview
```

此命令会启动一个服务来托管 `dist` 目录的内容。

## 📄 许可证

本项目当前未指定许可证。

## 🙏 贡献

欢迎贡献！请随时提出 Issue 或提交 Pull Request。（可以在此添加更详细的贡献指南）。
