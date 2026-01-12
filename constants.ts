import { ProjectFile, WindowId, WindowState } from "./types";

// 游戏主场景代码 (使用 module.exports 导出类)
const GAME_SCENE_CODE = `// GameScene.js
// Import dependencies
const { createEmitter } = require('./utils.js');

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

        // Use a helper imported from utils.js
        createEmitter(this, 'red', 'logo');

        const logo = this.physics.add.image(400, 100, 'logo');
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
        
        // Simple interaction
        logo.setInteractive();
        logo.on('pointerdown', () => {
            logo.setVelocityY(-300);
            console.log("Logo clicked!");
        });

        console.log("GameScene Created (Module Loaded)");
    }
}

// Export the class
module.exports = GameScene;`;

// 工具函数代码 (导出函数)
const UTILS_CODE = `// utils.js
// This file demonstrates how to export helper functions

function createEmitter(scene, particleKey, followTargetKey) {
    const particles = scene.add.particles(0, 0, particleKey, {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });
    
    scene.input.on('pointermove', (pointer) => {
        particles.setPosition(pointer.x, pointer.y);
    });
    
    console.log("[Utils] Emitter created from utils module");
    return particles;
}

// 导出对象
module.exports = {
    createEmitter
};`;

// 入口文件代码 (使用 require 导入场景)
const MAIN_CODE = `// main.js - Game entry file
// Import classes defined in other files via require
const GameScene = require('./GameScene.js');

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
    // Add the imported Scene class to the scene list
    scene: [GameScene]
};

const game = new Phaser.Game(config);

console.log("Main entry executed. Game initialized.");`;

// 初始文件列表
export const INITIAL_FILES: ProjectFile[] = [
    {
        id: 'main.js',
        name: 'main.js',
        content: MAIN_CODE,
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        history: []
    },
    {
        id: 'GameScene.js',
        name: 'GameScene.js',
        content: GAME_SCENE_CODE,
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        history: []
    },
    {
        id: 'utils.js',
        name: 'utils.js',
        content: UTILS_CODE,
        language: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        history: []
    }
];

// 初始窗口布局配置
// 优化后的 IDE 布局：左侧资源，中间代码+控制台，右侧预览
export const DEFAULT_WINDOWS: Record<WindowId, WindowState> = {
    [WindowId.EXPLORER]: {
        id: WindowId.EXPLORER,
        title: 'Explorer',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        // 左侧侧边栏，细长
        position: { x: 10, y: 10 },
        size: { width: 220, height: 680 }
    },
    [WindowId.EDITOR]: {
        id: WindowId.EDITOR,
        title: 'Code Editor',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 11,
        // 中间主要工作区
        position: { x: 240, y: 10 },
        size: { width: 700, height: 480 }
    },
    [WindowId.PREVIEW]: {
        id: WindowId.PREVIEW,
        title: 'Game Preview',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 12,
        // 右侧区域，适合展示游戏画面
        position: { x: 950, y: 10 },
        size: { width: 480, height: 380 }
    },
    [WindowId.CONSOLE]: {
        id: WindowId.CONSOLE,
        title: 'Console',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 13,
        // 放置在编辑器正下方，对齐编辑器宽度
        position: { x: 240, y: 500 },
        size: { width: 700, height: 190 }
    }
};
