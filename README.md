# PhaserForge Studio

A web-based mini IDE for Phaser game development: file explorer, code editor, live preview, and an in-app console for debugging.

<details>
  <summary><strong>中文简介</strong></summary>

PhaserForge Studio 是一个面向 Phaser 游戏开发的 Web 迷你 IDE：包含文件管理、代码编辑、实时预览与控制台调试。

</details>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Build & Preview](#build--preview)
- [Environment Variables (Optional)](#environment-variables-optional)
- [Project Notes](#project-notes)
- [Troubleshooting](#troubleshooting)
- [中文说明](#中文说明)

## Features

- File explorer: create, rename, delete, import, export
- Code editor: Monaco Editor with syntax highlighting
- Game preview: run the project in an isolated container
- Debug console: captures logs/warnings/errors from preview runtime
- Window system: draggable, resizable, minimize/maximize, focus management

## Tech Stack

- Vite + React + TypeScript
- Monaco Editor (`@monaco-editor/react`)
- UI icons (`lucide-react`)
- Runtime preview: Phaser 3 loaded via CDN and exposed as global `window.Phaser`
- Styling: Tailwind CSS via CDN (`cdn.tailwindcss.com`)

## Quick Start

- Node.js (recommended: 18+)
- bun
- Internet access (Phaser and Tailwind are loaded from CDN)

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the dev server:
   ```bash
   bun run dev
   ```
3. Open:
   - http://localhost:3000/

## Build & Preview

```bash
bun run build
bun run preview
```

## Environment Variables (Optional)

This app currently does not require API keys to run locally.  
`GEMINI_API_KEY` is read in [vite.config.ts](vite.config.ts) but is not used by the current UI logic; you can ignore it unless you add AI features later.

If you still want to set it:

1. Create `.env.local` in the project root
2. Add:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```

## Project Notes

- Dev server runs on port `3000` (see [vite.config.ts](vite.config.ts)).
- Phaser is loaded via CDN in [index.html](index.html) and available as global `Phaser`.
- The preview expects an entry file named `main.js`.
- A lightweight CommonJS-like loader is implemented for preview runtime so you can `require('./utils.js')` between your project files.

## Troubleshooting

- Blank preview / "Phaser not loaded": ensure network access; Phaser is loaded from CDN.
- "Cannot find entry file main.js": create `main.js` in the file explorer as the project entry.
- Port already in use: change `server.port` in [vite.config.ts](vite.config.ts).

---

<details>
  <summary><strong>中文说明</strong></summary>

## 简介

PhaserForge Studio 是一个面向 Phaser 游戏开发的 Web 迷你 IDE：包含文件管理、代码编辑、实时预览与控制台调试。

## 功能

- 文件管理：新建/重命名/删除/导入/导出
- 代码编辑器：Monaco Editor 语法高亮
- 游戏预览：在独立容器中运行项目
- 调试控制台：捕获预览运行时的 log/warn/error
- 窗口系统：拖拽、缩放、最小化/最大化、焦点管理

## 技术栈

- Vite + React + TypeScript
- Monaco Editor（`@monaco-editor/react`）
- 图标库（`lucide-react`）
- 运行时预览：通过 CDN 加载 Phaser 3，并以全局变量 `window.Phaser` 形式提供
- 样式：通过 CDN 引入 Tailwind CSS（`cdn.tailwindcss.com`）

## 本地运行

前置条件：

- Node.js（建议 18+）
- bun
- 需要联网（Phaser 与 Tailwind 通过 CDN 加载）

步骤：

1. 安装依赖：
   ```bash
   bun install
   ```
2. 启动开发服务器：
   ```bash
   bun run dev
   ```
3. 打开：
   - http://localhost:3000/

## 构建与预览

```bash
bun run build
bun run preview
```

## 环境变量（可选）

当前版本本地运行不需要任何 API Key。  
虽然 [vite.config.ts](vite.config.ts) 会读取 `GEMINI_API_KEY`，但现有 UI 逻辑并没有用到；除非你后续加 AI 功能，否则可以忽略。

如需配置：

1. 在项目根目录创建 `.env.local`
2. 添加：
   ```bash
   GEMINI_API_KEY=your_key_here
   ```

## 游戏预览机制说明

- 预览模块默认寻找入口文件 `main.js`
- Phaser 通过 `index.html` 从 CDN 加载，并以全局变量 `Phaser` 提供给用户代码
- 预览运行时实现了一个轻量的 CommonJS 风格加载器，支持在项目文件之间 `require('./utils.js')`

</details>
