// 文件接口定义
export interface ProjectFile {
    id: string;
    name: string;
    content: string;
    language: 'javascript' | 'typescript' | 'json';
    createdAt: number;
    updatedAt: number;
    history: FileVersion[]; // 版本历史记录
}

// 版本快照接口
export interface FileVersion {
    id: string;
    timestamp: number;
    content: string;
    label?: string; // 可选的备注标签
}

// 窗口ID枚举
export enum WindowId {
    EXPLORER = 'explorer',
    EDITOR = 'editor',
    PREVIEW = 'preview',
    CONSOLE = 'console'
}

// 窗口状态接口
export interface WindowState {
    id: WindowId;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

// 控制台日志类型
export type LogType = 'log' | 'info' | 'warn' | 'error';

// 控制台日志条目
export interface LogEntry {
    id: string;
    timestamp: number;
    type: LogType;
    message: string;
    args: any[];
}