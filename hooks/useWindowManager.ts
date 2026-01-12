import { useState, useCallback } from 'react';
import { WindowId, WindowState } from '../types';
import { DEFAULT_WINDOWS } from '../constants';

export const useWindowManager = () => {
    const [windows, setWindows] = useState<Record<WindowId, WindowState>>(DEFAULT_WINDOWS);

    const updateWindowState = useCallback((id: WindowId, newState: Partial<WindowState>) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], ...newState }
        }));
    }, []);

    const focusWindow = useCallback((id: WindowId) => {
        setWindows(prev => {
            const currentWindow = prev[id];
            const maxZ = Math.max(...(Object.values(prev) as WindowState[]).map(w => w.zIndex));
            
            // 如果已经是最大层级，不需要更新
            if (currentWindow.zIndex === maxZ) return prev;

            return {
                ...prev,
                [id]: { ...currentWindow, zIndex: maxZ + 1 }
            };
        });
    }, []);

    const toggleWindow = useCallback((id: WindowId) => {
        setWindows(prev => {
            const isOpen = prev[id].isOpen;
            if (isOpen) {
                return {
                    ...prev,
                    [id]: { ...prev[id], isOpen: false }
                };
            } else {
                const maxZ = Math.max(...(Object.values(prev) as WindowState[]).map(w => w.zIndex));
                return {
                    ...prev,
                    [id]: { ...prev[id], isOpen: true, zIndex: maxZ + 1, isMinimized: false }
                };
            }
        });
    }, []);

    const closeWindow = useCallback((id: WindowId) => {
        updateWindowState(id, { isOpen: false });
    }, [updateWindowState]);

    return {
        windows,
        updateWindowState,
        focusWindow,
        toggleWindow,
        closeWindow
    };
};