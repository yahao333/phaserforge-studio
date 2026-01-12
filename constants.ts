import { ProjectFile, WindowId, WindowState } from "./types";

const MAIN_TS_CODE = `// main.ts - Game entry file
// Using CommonJS require syntax (works in both JS and TS)
const { GameScene } = require('./GameScene');

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);
console.log("Main entry executed. Game initialized.");`;

const GAME_SCENE_TS_CODE = `// GameScene.ts
const { createEmitter, randomRange } = require('./utils');

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
    }

    create() {
        this.add.image(400, 300, 'sky');
        createEmitter(this, 'red', 'logo');

        const logo = this.physics.add.image(400, 100, 'logo');
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
        
        logo.setInteractive();
        logo.on('pointerdown', () => {
            logo.setVelocityY(-300);
            console.log("Logo clicked! TypeScript scene is working!");
        });

        console.log("GameScene Created (TypeScript Module)");
    }
}

module.exports = GameScene;`;

const UTILS_TS_CODE = `// utils.ts
// Helper functions for the game

function createEmitter(scene, particleKey, followTargetKey) {
    const particles = scene.add.particles(0, 0, particleKey, {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });
    
    scene.input.on('pointermove', (pointer) => {
        particles.setPosition(pointer.x, pointer.y);
    });
    
    console.log("[Utils] Emitter created from module");
    return particles;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = { createEmitter, randomRange };`;

export const INITIAL_FILES: ProjectFile[] = [
  {
    id: "main.ts",
    name: "main.ts",
    content: MAIN_TS_CODE,
    language: "typescript",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  },
  {
    id: "GameScene.ts",
    name: "GameScene.ts",
    content: GAME_SCENE_TS_CODE,
    language: "typescript",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  },
  {
    id: "utils.ts",
    name: "utils.ts",
    content: UTILS_TS_CODE,
    language: "typescript",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  },
];

// 初始窗口布局配置
// 优化后的 IDE 布局：左侧资源，中间代码+控制台，右侧预览
export const DEFAULT_WINDOWS: Record<WindowId, WindowState> = {
  [WindowId.EXPLORER]: {
    id: WindowId.EXPLORER,
    title: "Explorer",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    // 左侧侧边栏，细长
    position: { x: 10, y: 10 },
    size: { width: 220, height: 680 },
  },
  [WindowId.EDITOR]: {
    id: WindowId.EDITOR,
    title: "Code Editor",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 11,
    // 中间主要工作区
    position: { x: 240, y: 10 },
    size: { width: 700, height: 480 },
  },
  [WindowId.PREVIEW]: {
    id: WindowId.PREVIEW,
    title: "Game Preview",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 12,
    // 右侧区域，适合展示游戏画面
    position: { x: 950, y: 10 },
    size: { width: 480, height: 380 },
  },
  [WindowId.CONSOLE]: {
    id: WindowId.CONSOLE,
    title: "Console",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 13,
    // 放置在编辑器正下方，对齐编辑器宽度
    position: { x: 240, y: 500 },
    size: { width: 700, height: 190 },
  },
};
