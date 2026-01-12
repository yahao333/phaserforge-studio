import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowState } from '../types';
import { Maximize2, Minimize2, X, Minus } from 'lucide-react';

interface WindowPanelProps {
    windowState: WindowState;
    onUpdate: (state: Partial<WindowState>) => void;
    onClose: () => void;
    onFocus: () => void;
    children: React.ReactNode;
}

/**
 * 基础窗口面板组件
 * 功能：支持拖动、调整大小、最大化、最小化、层级管理
 */
const WindowPanel: React.FC<WindowPanelProps> = ({ windowState, onUpdate, onClose, onFocus, children }) => {
    // 引用面板DOM以直接操作位置，避免React渲染周期的卡顿，但为了状态同步最终还是会更新state
    const panelRef = useRef<HTMLDivElement>(null);
    
    // 拖动状态
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // 调整大小状态
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string>('');
    const [initialResize, setInitialResize] = useState({ width: 0, height: 0, x: 0, y: 0, mouseX: 0, mouseY: 0 });

    // 处理鼠标按下标题栏开始拖动
    const handleMouseDownHeader = (e: React.MouseEvent) => {
        if (windowState.isMaximized) return; // 最大化时不可拖动
        
        console.log(`[WindowPanel: ${windowState.title}] 开始拖动`);
        setIsDragging(true);
        // 计算鼠标点击位置相对于窗口左上角的偏移
        setDragOffset({
            x: e.clientX - windowState.position.x,
            y: e.clientY - windowState.position.y
        });
        onFocus(); // 激活窗口
        e.preventDefault();
    };

    // 处理全局鼠标移动（拖动和调整大小）
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                // 计算新位置
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                
                // 使用 requestAnimationFrame 优化性能 (此处简化直接更新)
                onUpdate({
                    position: { x: newX, y: newY }
                });
            } else if (isResizing) {
                let newWidth = initialResize.width;
                let newHeight = initialResize.height;
                let newX = initialResize.x;
                let newY = initialResize.y;
                
                const deltaX = e.clientX - initialResize.mouseX;
                const deltaY = e.clientY - initialResize.mouseY;

                // 根据方向调整尺寸和位置
                if (resizeDirection.includes('e')) {
                    newWidth = Math.max(200, initialResize.width + deltaX);
                }
                if (resizeDirection.includes('s')) {
                    newHeight = Math.max(150, initialResize.height + deltaY);
                }
                if (resizeDirection.includes('w')) {
                    const possibleWidth = Math.max(200, initialResize.width - deltaX);
                    if (possibleWidth !== 200) {
                        newWidth = possibleWidth;
                        newX = initialResize.x + deltaX;
                    }
                }
                if (resizeDirection.includes('n')) {
                    const possibleHeight = Math.max(150, initialResize.height - deltaY);
                    if (possibleHeight !== 150) {
                        newHeight = possibleHeight;
                        newY = initialResize.y + deltaY;
                    }
                }

                onUpdate({
                    size: { width: newWidth, height: newHeight },
                    position: { x: newX, y: newY }
                });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                console.log(`[WindowPanel: ${windowState.title}] 结束拖动`);
                setIsDragging(false);
            }
            if (isResizing) {
                console.log(`[WindowPanel: ${windowState.title}] 结束调整大小`);
                setIsResizing(false);
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, initialResize, onUpdate, resizeDirection, windowState.title]);

    // 开始调整大小
    const startResize = (direction: string, e: React.MouseEvent) => {
        console.log(`[WindowPanel: ${windowState.title}] 开始调整大小: ${direction}`);
        e.stopPropagation();
        onFocus();
        setIsResizing(true);
        setResizeDirection(direction);
        setInitialResize({
            width: windowState.size.width,
            height: windowState.size.height,
            x: windowState.position.x,
            y: windowState.position.y,
            mouseX: e.clientX,
            mouseY: e.clientY
        });
    };

    // 切换最大化
    const toggleMaximize = () => {
        console.log(`[WindowPanel: ${windowState.title}] 切换最大化状态: ${!windowState.isMaximized}`);
        onUpdate({ isMaximized: !windowState.isMaximized });
        onFocus();
    };

    // 切换最小化
    const toggleMinimize = () => {
        console.log(`[WindowPanel: ${windowState.title}] 切换最小化状态: ${!windowState.isMinimized}`);
        onUpdate({ isMinimized: !windowState.isMinimized });
    };

    if (!windowState.isOpen) return null;

    // 计算样式
    const style: React.CSSProperties = {
        position: 'absolute',
        zIndex: windowState.zIndex,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1f2937', // gray-800
        border: '1px solid #374151', // gray-700
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        transition: isDragging || isResizing ? 'none' : 'width 0.2s, height 0.2s, top 0.2s, left 0.2s',
    };

    if (windowState.isMaximized) {
        style.top = 0;
        style.left = 0;
        style.width = '100vw';
        style.height = '100vh';
        style.borderRadius = 0;
    } else if (windowState.isMinimized) {
        // 最小化时只显示标题栏，位置固定在左下角堆叠或仅改变高度
        // 这里简化为缩小高度
        style.top = windowState.position.y;
        style.left = windowState.position.x;
        style.width = 200;
        style.height = 40;
    } else {
        style.top = windowState.position.y;
        style.left = windowState.position.x;
        style.width = windowState.size.width;
        style.height = windowState.size.height;
    }

    return (
        <div 
            ref={panelRef}
            style={style}
            onMouseDown={() => onFocus()}
            className="group"
        >
            {/* 标题栏 */}
            <div 
                className="h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-3 cursor-move select-none shrink-0"
                onMouseDown={handleMouseDownHeader}
            >
                <div className="flex items-center gap-2 text-gray-200 font-medium text-sm truncate">
                    {windowState.title}
                </div>
                <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                    <button onClick={toggleMinimize} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="最小化">
                        <Minus size={14} />
                    </button>
                    <button onClick={toggleMaximize} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="最大化">
                        <Maximize2 size={14} />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors" title="关闭">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* 内容区域 (最小化时不显示) */}
            {!windowState.isMinimized && (
                <div className="flex-1 overflow-hidden relative bg-gray-800">
                    {children}
                    {/* 遮罩层，防止拖动时 iframe/canvas 捕获鼠标事件 */}
                    {(isDragging || isResizing) && (
                        <div className="absolute inset-0 bg-transparent z-50" />
                    )}
                </div>
            )}

            {/* 调整大小手柄 (最大化/最小化时不显示) */}
            {!windowState.isMaximized && !windowState.isMinimized && (
                <>
                    {/* 右边框 */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize('e', e)} />
                    {/* 下边框 */}
                    <div className="absolute left-0 bottom-0 right-0 h-1 cursor-s-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize('s', e)} />
                    {/* 左边框 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize('w', e)} />
                    {/* 上边框 */}
                    <div className="absolute left-0 top-0 right-0 h-1 cursor-n-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize('n', e)} />
                    {/* 右下角 */}
                    <div className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize z-50 bg-transparent" onMouseDown={(e) => startResize('se', e)} />
                    {/* 左下角 */}
                    <div className="absolute left-0 bottom-0 w-4 h-4 cursor-sw-resize z-50 bg-transparent" onMouseDown={(e) => startResize('sw', e)} />
                    {/* 右上角 */}
                    <div className="absolute right-0 top-0 w-4 h-4 cursor-ne-resize z-50 bg-transparent" onMouseDown={(e) => startResize('ne', e)} />
                    {/* 左上角 */}
                    <div className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize z-50 bg-transparent" onMouseDown={(e) => startResize('nw', e)} />
                </>
            )}
        </div>
    );
};

export default WindowPanel;