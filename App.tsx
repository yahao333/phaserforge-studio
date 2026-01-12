import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WindowId, LogEntry } from './types';

import WindowPanel from './components/WindowPanel';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import GamePreview from './components/GamePreview';
import ConsolePanel from './components/ConsolePanel';

// 引入自定义 Hooks
import { useFileSystem } from './hooks/useFileSystem';
import { useWindowManager } from './hooks/useWindowManager';

import { Layout, Terminal, Code, Gamepad2, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
    // --- 状态管理 ---
    
    // 使用自定义 Hook 管理窗口状态
    const { 
        windows, 
        updateWindowState, 
        focusWindow, 
        toggleWindow, 
        closeWindow 
    } = useWindowManager();
    
    // 使用自定义 Hook 管理文件系统
    const {
        files,
        activeFileId,
        setActiveFileId,
        activeFile,
        createFile,
        deleteFile,
        renameFile,
        updateFileContent,
        saveFile,
        restoreVersion,
        importFile,
        exportFile
    } = useFileSystem();
    
    // 日志系统 (保持在 App 中，因为它作为胶水连接 Console 和 Preview)
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // --- 逻辑方法 ---

    // 日志拦截
    useEffect(() => {
        // 保存原始 console 方法
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        const addLog = (type: 'log' | 'warn' | 'error' | 'info', args: any[]) => {
            const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
            const newLog: LogEntry = {
                id: uuidv4(),
                timestamp: Date.now(),
                type,
                message,
                args // 保留原始参数以便在UI中更详细展示
            };
            setLogs(prev => [...prev.slice(-99), newLog]); // 保留最近100条
        };

        // 注入到 window 对象供 Preview 组件内的代码使用
        (window as any).__custom_console__ = {
            log: (...args: any[]) => { originalLog(...args); addLog('log', args); },
            warn: (...args: any[]) => { originalWarn(...args); addLog('warn', args); },
            error: (...args: any[]) => { originalError(...args); addLog('error', args); },
            info: (...args: any[]) => { originalInfo(...args); addLog('info', args); },
        };

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <div className="w-screen h-screen bg-gray-950 overflow-hidden relative font-sans select-none">
            {/* 底部任务栏/状态栏 */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#161b22] border-t border-gray-800 flex items-center px-4 z-[9999] justify-between">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-blue-500 flex items-center gap-2">
                        <Gamepad2 size={20} />
                        <span>PhaserForge Studio</span>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4 border-l border-gray-700 pl-4">
                        <button 
                            onClick={() => toggleWindow(WindowId.EXPLORER)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${windows[WindowId.EXPLORER].isOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="资源管理器"
                        >
                            <FolderOpen size={16} />
                        </button>
                        <button 
                            onClick={() => toggleWindow(WindowId.EDITOR)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${windows[WindowId.EDITOR].isOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="代码编辑器"
                        >
                            <Code size={16} />
                        </button>
                        <button 
                            onClick={() => toggleWindow(WindowId.PREVIEW)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${windows[WindowId.PREVIEW].isOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="游戏预览"
                        >
                            <Gamepad2 size={16} />
                        </button>
                        <button 
                            onClick={() => toggleWindow(WindowId.CONSOLE)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${windows[WindowId.CONSOLE].isOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="控制台"
                        >
                            <Terminal size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="text-gray-500 text-xs flex items-center gap-4">
                    <span>Phaser v3.60.0</span>
                    <span>{activeFile ? `Editing: ${activeFile.name}` : 'No file selected'}</span>
                </div>
            </div>

            {/* 工作区背景 */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
                <Layout size={300} className="text-white" />
            </div>

            {/* --- 浮动窗口区域 --- */}

            <WindowPanel
                windowState={windows[WindowId.EXPLORER]}
                onUpdate={(state) => updateWindowState(WindowId.EXPLORER, state)}
                onClose={() => closeWindow(WindowId.EXPLORER)}
                onFocus={() => focusWindow(WindowId.EXPLORER)}
            >
                <FileExplorer
                    files={files}
                    activeFileId={activeFileId}
                    onSelectFile={setActiveFileId}
                    onCreateFile={createFile}
                    onDeleteFile={deleteFile}
                    onRenameFile={renameFile}
                    onUploadFile={importFile}
                    onDownloadFile={exportFile}
                />
            </WindowPanel>

            <WindowPanel
                windowState={windows[WindowId.EDITOR]}
                onUpdate={(state) => updateWindowState(WindowId.EDITOR, state)}
                onClose={() => closeWindow(WindowId.EDITOR)}
                onFocus={() => focusWindow(WindowId.EDITOR)}
            >
                {activeFile ? (
                    <CodeEditor
                        code={activeFile.content}
                        language={activeFile.language}
                        history={activeFile.history}
                        onChange={updateFileContent}
                        onSave={saveFile}
                        onRestore={restoreVersion}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 bg-[#1e1e1e]">
                        请在资源管理器中选择一个文件
                    </div>
                )}
            </WindowPanel>

            <WindowPanel
                windowState={windows[WindowId.PREVIEW]}
                onUpdate={(state) => updateWindowState(WindowId.PREVIEW, state)}
                onClose={() => closeWindow(WindowId.PREVIEW)}
                onFocus={() => focusWindow(WindowId.PREVIEW)}
            >
                <GamePreview 
                    files={files} 
                    onError={(msg) => setLogs(prev => [...prev, { id: uuidv4(), timestamp: Date.now(), type: 'error', message: msg, args: [] }])}
                />
            </WindowPanel>

            <WindowPanel
                windowState={windows[WindowId.CONSOLE]}
                onUpdate={(state) => updateWindowState(WindowId.CONSOLE, state)}
                onClose={() => closeWindow(WindowId.CONSOLE)}
                onFocus={() => focusWindow(WindowId.CONSOLE)}
            >
                <ConsolePanel 
                    logs={logs} 
                    onClear={() => setLogs([])} 
                />
            </WindowPanel>

        </div>
    );
};

export default App;