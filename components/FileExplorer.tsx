import React, { useState, useRef, useEffect } from "react";
import { ProjectFile } from "../types";
import { useI18n } from "../i18nContext";
import {
  FileCode,
  FilePlus,
  Download,
  Upload,
  Trash2,
  Search,
  Edit2,
} from "lucide-react";

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void; // 新增重命名回调
  onUploadFile: (file: File) => void;
  onDownloadFile: (id: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
  onDownloadFile,
}) => {
  // 获取翻译函数
  const { t } = useI18n();

  // 搜索查询状态
  const [searchQuery, setSearchQuery] = useState("");

  // 新建文件状态
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);

  // 重命名状态
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // 当进入创建模式时，自动聚焦输入框
  useEffect(() => {
    if (isCreating && createInputRef.current) {
      createInputRef.current.focus();
      setNewFileName(t("fileExplorer.defaultFileName"));
      console.log(`[文件管理器] ${t("fileExplorer.creatingFile")}`);
    }
  }, [isCreating, t]);

  // 当进入编辑模式时，自动聚焦输入框
  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus();
      console.log(`[文件管理器] ${t("fileExplorer.renaming")}`);
    }
  }, [editingFileId, t]);

  // 处理创建提交
  const handleCreateSubmit = () => {
    if (!newFileName.trim()) {
      setIsCreating(false);
      return;
    }
    console.log(
      `[文件管理器] ${t("system.creatingFile")} ${newFileName.trim()}`,
    );
    onCreateFile(newFileName.trim());
    setIsCreating(false);
    setNewFileName("");
  };

  // 启动重命名
  const startRenaming = (e: React.MouseEvent, file: ProjectFile) => {
    e.stopPropagation(); // 防止触发文件选择
    console.log(`[文件管理器] ${t("system.renamingFile")} ${file.name}`);
    setEditingFileId(file.id);
    setEditFileName(file.name);
  };

  // 提交重命名
  const handleRenameSubmit = () => {
    if (!editingFileId) return;

    const trimmedName = editFileName.trim();
    if (
      trimmedName &&
      trimmedName !== files.find((f) => f.id === editingFileId)?.name
    ) {
      console.log(
        `[文件管理器] 提交重命名: ${files.find((f) => f.id === editingFileId)?.name} -> ${trimmedName}`,
      );
      onRenameFile(editingFileId, trimmedName);
    }

    // 结束编辑状态
    setEditingFileId(null);
    setEditFileName("");
  };

  // 处理文件上传
  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.ts,.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log(`[文件管理器] ${t("system.uploadingFile")} ${file.name}`);
        onUploadFile(file);
      }
    };
    input.click();
  };

  // 根据搜索关键词过滤文件
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-sm">
      {/* 顶部区域：标题栏 + 工具栏 + 搜索框 */}
      <div className="flex flex-col border-b border-gray-700 bg-[#161b22] shrink-0">
        <div className="flex items-center justify-between p-2">
          <span className="text-gray-400 font-semibold px-2">
            {t("fileExplorer.title")}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setIsCreating(true)}
              className={`p-1 rounded text-gray-400 hover:text-white transition-colors ${isCreating ? "bg-gray-700 text-white" : "hover:bg-gray-700"}`}
              title={t("fileExplorer.newFile")}
            >
              <FilePlus size={16} />
            </button>
            <button
              onClick={handleUploadClick}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title={t("fileExplorer.uploadFile")}
            >
              <Upload size={16} />
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="px-2 pb-2">
          <div className="relative group">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={12}
            />
            <input
              type="text"
              placeholder={t("fileExplorer.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] text-gray-300 text-xs rounded border border-gray-700 pl-7 pr-2 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-[#1c2128] transition-all placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* 内联新建文件输入框 */}
        {isCreating && (
          <div className="flex items-center gap-2 p-2 rounded bg-[#1c2128] border border-blue-500 shadow-lg mb-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <FileCode size={16} className="text-blue-400 shrink-0" />
            <input
              ref={createInputRef}
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSubmit();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFileName("");
                }
              }}
              onBlur={handleCreateSubmit} // 失去焦点自动提交
              className="bg-transparent text-xs text-white focus:outline-none flex-1 min-w-0 font-mono"
              placeholder={t("fileExplorer.placeholder")}
            />
          </div>
        )}

        {filteredFiles.length > 0
          ? filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between group p-2 rounded cursor-pointer transition-colors ${
                  activeFileId === file.id && editingFileId !== file.id
                    ? "bg-blue-900 text-blue-100"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
                onClick={() => onSelectFile(file.id)}
              >
                <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                  <FileCode
                    size={16}
                    className={`${activeFileId === file.id ? "text-blue-300" : "text-yellow-500"} shrink-0`}
                  />

                  {/* 正常模式 vs 编辑模式 */}
                  {editingFileId === file.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editFileName}
                      onChange={(e) => setEditFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit();
                        if (e.key === "Escape") {
                          setEditingFileId(null);
                          setEditFileName("");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()} // 防止触发父级click
                      onBlur={handleRenameSubmit}
                      className="bg-[#0d1117] text-white text-xs border border-blue-500 rounded px-1 py-0.5 w-full focus:outline-none font-mono"
                    />
                  ) : (
                    <span className="truncate text-xs" title={file.name}>
                      {file.name}
                    </span>
                  )}
                </div>

                {/* 操作按钮 (非编辑模式下显示) */}
                {editingFileId !== file.id && (
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => startRenaming(e, file)}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                      title={t("fileExplorer.rename")}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadFile(file.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                      title={t("fileExplorer.download")}
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const deleteConfirm = t(
                          "fileExplorer.deleteConfirm",
                        ).replace("{name}", file.name);
                        if (confirm(deleteConfirm)) onDeleteFile(file.id);
                      }}
                      className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-300"
                      title={t("fileExplorer.delete")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))
          : !isCreating && (
              <div className="text-center text-gray-500 mt-10 text-xs">
                {searchQuery
                  ? t("fileExplorer.noMatchingFiles")
                  : t("fileExplorer.noFiles")}
              </div>
            )}
      </div>
    </div>
  );
};

export default FileExplorer;
