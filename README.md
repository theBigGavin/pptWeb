# PPTWeb - Visual PowerPoint Editor

**[🚀 Live Demo](https://thebiggavin.github.io/pptWeb/)**

[![React](https://img.shields.io/badge/React-^19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-^6.2.0-yellow?logo=vite)](https://vitejs.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-^11.11.4-orange)](https://reactflow.dev/)
[![PptxGenJS](https://img.shields.io/badge/PptxGenJS-^3.12.0-red)](https://gitbrent.github.io/PptxGenJS/)
[![Yarn](https://img.shields.io/badge/Yarn-^1.22.22-blue?logo=yarn)](https://yarnpkg.com/)
[![ESLint](https://img.shields.io/badge/ESLint-^9.21.0-purple?logo=eslint)](https://eslint.org/)

A web-based visual editor for creating PowerPoint presentations using a node-based interface. Built with React, TypeScript, Vite, React Flow, and PptxGenJS.

## ✨ Features

- **Visual Slide Editor**: Use a node-based interface (powered by React Flow) to add, arrange, and visualize your presentation slides.
- **Detailed Slide Properties**: Select a slide node to edit its title, choose a layout (affecting available content areas), and input text into up to four distinct content areas via a properties panel.
- **Toolbar Actions**:
  - Add new slides.
  - Automatically arrange slides using Dagre.js (`Auto Layout`).
  - Save the current presentation state to browser local storage (`Save`).
  - Load the previously saved state from local storage (`Load`).
  - Export the visual layout directly into a `.pptx` file using PptxGenJS (`Export PPTX`). Slides are ordered based on their vertical position.
  - Access application settings (`Settings`).
- **Layer-Based Editing**:
  - **Layer Panel**: Select a slide node to view its layers (background, title, text, media, etc.) in a hierarchical tree view on the left panel.
  - **Properties Panel**: Select a layer in the Layer Panel to edit its specific properties (name, content, position, size, text format, media URL, etc.) on the right panel.
  - **Direct Manipulation**: Directly drag layers within a slide node on the canvas to change their position. Select a layer to reveal resize handles and drag them to adjust its size.
  - **Add Layers**: Add new text or image layers to the selected slide via buttons in the Layer Panel.
- **PPTX Export**: Export your visual layout directly into a `.pptx` file. Slides are ordered based on their vertical position in the editor. Layouts and content from the properties panel are included.
- **Local Storage Persistence**: Save your work in the browser and reload it later.
- **Custom Controls & Minimap**: Enhanced canvas navigation with zoom controls, node focusing, and a minimap overview.
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
    git clone https://github.com/theBigGavin/pptWeb.git
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

### Running Tests

To run the unit tests using Vitest:

```bash
yarn test
```

This will run the tests located in the `tests` directory in watch mode.

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
