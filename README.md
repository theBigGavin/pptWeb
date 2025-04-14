# PPTWeb - Visual PowerPoint Editor

[![React](https://img.shields.io/badge/React-^19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-^6.2.0-yellow?logo=vite)](https://vitejs.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-^11.11.4-orange)](https://reactflow.dev/)
[![PptxGenJS](https://img.shields.io/badge/PptxGenJS-^3.12.0-red)](https://gitbrent.github.io/PptxGenJS/)
[![Yarn](https://img.shields.io/badge/Yarn-^1.22.22-blue?logo=yarn)](https://yarnpkg.com/)
[![ESLint](https://img.shields.io/badge/ESLint-^9.21.0-purple?logo=eslint)](https://eslint.org/)

A web-based visual editor for creating PowerPoint presentations using a node-based interface. Built with React, TypeScript, Vite, React Flow, and PptxGenJS.

![image](https://github.com/user-attachments/assets/11111111-2222-3333-4444-555555555555) // Placeholder for screenshot - Replace with actual screenshot URL later

## ✨ Features

- **Visual Slide Editor**: Use a node-based interface (powered by React Flow) to add, arrange, and visualize your presentation slides.
- **Slide Properties**: Select a slide node to edit its title and content preview via a properties panel.
- **PPTX Export**: Export your visual layout directly into a `.pptx` file using PptxGenJS. Slides are ordered based on their vertical position in the editor.
- **Modern Tech Stack**: Built with React 19, TypeScript, and Vite for a fast development experience.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/) (^19.0.0)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (~5.7.2)
- **Build Tool**: [Vite](https://vitejs.dev/) (^6.2.0)
- **Node-Based UI**: [React Flow](https://reactflow.dev/) (^11.11.4)
- **PPTX Generation**: [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (^3.12.0)
- **Package Manager**: [Yarn](https://yarnpkg.com/) (^1.22.22)
- **Linting**: [ESLint](https://eslint.org/) (^9.21.0)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.x)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd pptweb
    ```
2.  Install dependencies using Yarn:
    ```bash
    yarn install
    ```

### Running the Development Server

To start the Vite development server with Hot Module Replacement (HMR):

```bash
yarn dev
```

Open your browser and navigate to the URL provided (usually `http://localhost:5173`).

### Building for Production

To create an optimized production build:

```bash
yarn build
```

The output files will be generated in the `dist` directory.

### Previewing the Production Build

To preview the production build locally:

```bash
yarn preview
```

This command serves the `dist` directory.

## 📄 License

This project is currently unlicensed.

## 🙏 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request. (Further contribution guidelines can be added here).
