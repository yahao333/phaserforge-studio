import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProjectFile, FileVersion } from '../types';
import { INITIAL_FILES } from '../constants';

export const useFileSystem = () => {
    // 文件状态初始化：优先从 localStorage 读取
    const [files, setFiles] = useState<ProjectFile[]>(() => {
        const saved = localStorage.getItem('phaserforge_files');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 数据迁移：确保所有文件都有 history 字段
                return parsed.map((f: any) => ({
                    ...f,
                    history: Array.isArray(f.history) ? f.history : []
                }));
            } catch (e) {
                console.error("Failed to parse saved files", e);
                return INITIAL_FILES;
            }
        }
        return INITIAL_FILES;
    });

    const [activeFileId, setActiveFileId] = useState<string | null>(files[0]?.id || null);

    // 自动持久化
    useEffect(() => {
        localStorage.setItem('phaserforge_files', JSON.stringify(files));
    }, [files]);

    const activeFile = files.find(f => f.id === activeFileId);

    // 创建文件
    const createFile = useCallback((name: string) => {
        if (!name) return;
        
        if (files.some(f => f.name === name)) {
            console.warn("文件名已存在");
            alert("文件名已存在，请使用其他名称。");
            return; 
        }

        const newFile: ProjectFile = {
            id: uuidv4(),
            name,
            content: name.endsWith('.json') ? '{\n\t\n}' : '// 新建脚本\n',
            language: name.endsWith('.json') ? 'json' : 'javascript',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            history: []
        };
        
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
        console.log(`[FileSystem] 创建文件: ${name}`);
    }, [files]);

    // 删除文件
    const deleteFile = useCallback((id: string) => {
        const fileToDelete = files.find(f => f.id === id);
        if (!fileToDelete) return;

        // 保护机制
        if (fileToDelete.name === 'main.js') {
            const msg = "无法删除系统入口文件 'main.js'，因为它对游戏运行至关重要。";
            console.warn(`[FileSystem] 删除阻止: ${msg}`);
            alert(msg);
            return;
        }

        // 计算新的文件列表
        const newFiles = files.filter(f => f.id !== id);
        setFiles(newFiles);

        // 如果删除的是当前激活的文件，尝试切换到临近的文件
        if (activeFileId === id) {
            const deletedIndex = files.findIndex(f => f.id === id);
            
            if (newFiles.length > 0) {
                // 尝试停留在当前索引
                const newIndex = Math.min(deletedIndex, newFiles.length - 1);
                const nextFile = newFiles[newIndex];
                if (nextFile) {
                    setActiveFileId(nextFile.id);
                    console.log(`[FileSystem] 自动切换至文件: ${nextFile.name}`);
                }
            } else {
                setActiveFileId(null);
            }
        }
        console.log(`[FileSystem] 删除文件成功: ${fileToDelete.name}`);
    }, [files, activeFileId]);

    // 重命名文件
    const renameFile = useCallback((id: string, newName: string) => {
        if (!newName.trim()) return;

        // 检查重名 (排除自己)
        const isDuplicate = files.some(f => f.name === newName && f.id !== id);
        if (isDuplicate) {
            console.warn(`[FileSystem] 重命名失败: 文件名 '${newName}' 已存在`);
            alert(`文件名 '${newName}' 已存在，请重试。`);
            return;
        }

        setFiles(prevFiles => prevFiles.map(f => {
            if (f.id === id) {
                console.log(`[FileSystem] 文件重命名: ${f.name} -> ${newName}`);
                return { ...f, name: newName, updatedAt: Date.now() };
            }
            return f;
        }));
    }, [files]);

    // 更新文件内容（不生成历史版本，用于打字过程中的实时更新）
    const updateFileContent = useCallback((newContent: string | undefined) => {
        if (!activeFileId || newContent === undefined) return;
        
        setFiles(prev => prev.map(f => 
            f.id === activeFileId ? { ...f, content: newContent, updatedAt: Date.now() } : f
        ));
    }, [activeFileId]);

    // 保存文件（生成历史版本）
    const saveFile = useCallback((contentOverride?: string) => {
        const currentFile = files.find(f => f.id === activeFileId);
        
        if (currentFile) {
            const contentToSave = contentOverride !== undefined ? contentOverride : currentFile.content;
            
            console.log(`[FileSystem] 保存文件: ${currentFile.name} (长度: ${contentToSave.length})`);
            
            const newVersion: FileVersion = {
                id: uuidv4(),
                timestamp: Date.now(),
                content: contentToSave,
                label: `版本 ${currentFile.history.length + 1}`
            };

            setFiles(prev => prev.map(f => 
                f.id === activeFileId 
                    ? { 
                        ...f, 
                        content: contentToSave,
                        history: [newVersion, ...f.history],
                        updatedAt: Date.now()
                      }
                    : f
            ));
        }
    }, [files, activeFileId]);

    // 恢复版本
    const restoreVersion = useCallback((versionId: string) => {
        const currentFile = files.find(f => f.id === activeFileId);
        if (!currentFile) return;

        const version = currentFile.history.find(v => v.id === versionId);
        if (version) {
            if (confirm(`确定要恢复到 ${new Date(version.timestamp).toLocaleTimeString()} 的版本吗？当前未保存的修改将丢失。`)) {
                console.log(`[FileSystem] 恢复文件版本: ${version.id}`);
                updateFileContent(version.content);
            }
        }
    }, [files, activeFileId, updateFileContent]);

    // 导入文件
    const importFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const newFile: ProjectFile = {
                id: uuidv4(),
                name: file.name,
                content,
                language: file.name.endsWith('.json') ? 'json' : 'javascript',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                history: []
            };
            setFiles(prev => [...prev, newFile]);
            setActiveFileId(newFile.id);
        };
        reader.readAsText(file);
    }, []);

    // 导出文件
    const exportFile = useCallback((id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;
        
        const blob = new Blob([file.content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    }, [files]);

    return {
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
    };
};