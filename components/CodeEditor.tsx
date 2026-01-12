import React, { useState, useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  Save,
  History,
  RotateCcw,
  X,
  FileJson,
  CheckSquare,
  Square,
} from "lucide-react";
import { FileVersion } from "../types";
// 导入 Prettier (Standalone)
import * as prettier from "prettier/standalone";
// 导入插件
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
// 导入国际化
import { useI18n } from "../i18nContext";

interface CodeEditorProps {
  code: string;
  language: string;
  history?: FileVersion[];
  onChange: (value: string | undefined) => void;
  onSave: (contentOverride?: string) => void; // 更新签名，支持传入覆盖内容
  onRestore: (versionId: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  history = [],
  onChange,
  onSave,
  onRestore,
}) => {
  // 获取翻译函数
  const { t } = useI18n();

  // 是否显示历史记录侧边栏
  const [showHistory, setShowHistory] = useState(false);
  // 是否开启保存时自动格式化
  const [formatOnSave, setFormatOnSave] = useState(true);
  // 是否正在格式化（避免重复触发）
  const [isFormatting, setIsFormatting] = useState(false);

  const editorRef = useRef<any>(null);

  // 格式化代码的核心逻辑
  const performFormat = async (currentCode: string): Promise<string> => {
    try {
      console.log("[Prettier] 开始格式化...");
      // Prettier 3.x 是异步的
      const formatted = await prettier.format(currentCode, {
        parser: "babel", // 主要处理 JS/TS/JSON (通过 estree)
        plugins: [parserBabel as any, parserEstree as any],
        semi: true,
        singleQuote: true,
        trailingComma: "none",
        tabWidth: 4,
        printWidth: 100,
      });
      console.log("[Prettier] 格式化成功");
      return formatted;
    } catch (error) {
      console.error("[Prettier] 格式化失败:", error);
      // 格式化失败返回原代码，不阻塞用户
      return currentCode;
    }
  };

  // 统一的保存处理动作 (核心修复：解决按钮点击和快捷键逻辑不一致问题)
  const handleSaveAction = async () => {
    // 如果编辑器实例不可用，降级处理
    if (!editorRef.current) {
      onSave();
      return;
    }

    // 1. 获取编辑器当前瞬间的最新值，防止 React 状态异步更新导致的旧值问题
    const currentVal = editorRef.current.getValue();
    let finalCode = currentVal;

    // 2. 处理自动格式化
    if (formatOnSave) {
      setIsFormatting(true);
      try {
        finalCode = await performFormat(currentVal);

        // 如果代码有变化，应用到编辑器（保留撤销栈）
        if (finalCode !== currentVal) {
          const model = editorRef.current.getModel();
          if (model) {
            editorRef.current.executeEdits("prettier-save", [
              {
                range: model.getFullModelRange(),
                text: finalCode,
                forceMoveMarkers: true,
              },
            ]);
            // 更新React状态
            onChange(finalCode);
          }
        }
      } catch (e) {
        console.error("Format failed", e);
      } finally {
        setIsFormatting(false);
      }
    }

    // 3. 调用父组件保存，传入（可能已格式化的）最新代码
    onSave(finalCode);
  };

  // --- 关键修复：解决 Monaco addCommand 的闭包陷阱 ---
  // Monaco 的 addCommand 只在初始化时绑定一次，会导致它捕获旧的 handleSaveAction (即旧的 onSave/files)
  // 我们使用 Ref 来确保存储的是最新的函数引用
  const handleSaveActionRef = useRef(handleSaveAction);

  // 每次渲染时更新 Ref，保证它是最新的
  useEffect(() => {
    handleSaveActionRef.current = handleSaveAction;
  }); // 省略依赖数组，使其在每次渲染后更新

  // 手动点击格式化按钮
  const handleManualFormat = async () => {
    if (!editorRef.current || isFormatting) return;
    setIsFormatting(true);

    const currentVal = editorRef.current.getValue();
    const formatted = await performFormat(currentVal);

    if (formatted !== currentVal) {
      // 使用 executeEdits 保留撤销栈
      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.executeEdits("prettier", [
          {
            range: model.getFullModelRange(),
            text: formatted,
            forceMoveMarkers: true,
          },
        ]);
        // 更新父组件状态
        onChange(formatted);
      }
    }
    setIsFormatting(false);
  };

  // 编辑器加载完成回调
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    console.log("[代码编辑器] Monaco Editor 已加载");
    editorRef.current = editor;

    // 1. 注册文档格式化提供者 (Right click -> Format Document)
    monaco.languages.registerDocumentFormattingEditProvider("javascript", {
      provideDocumentFormattingEdits: async (model) => {
        const text = model.getValue();
        const formatted = await performFormat(text);
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    });

    // 2. 覆盖默认的 Ctrl+S 行为，使用 Ref 调用最新的保存逻辑
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("[代码编辑器] 触发保存快捷键");
      // 必须通过 Ref 调用，否则会使用闭包中旧的 handleSaveAction
      handleSaveActionRef.current();
    });
  };

  // 切换保存时格式化开关
  const toggleFormatOnSave = () => {
    setFormatOnSave(!formatOnSave);
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col relative">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333] shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 font-mono select-none flex items-center gap-2">
            <span>{language.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 格式化配置区 */}
          <div className="flex items-center mr-2 pr-2 border-r border-gray-700 gap-2">
            <button
              onClick={toggleFormatOnSave}
              className={`flex items-center gap-1 text-[10px] cursor-pointer ${formatOnSave ? "text-blue-400" : "text-gray-500"}`}
              title={t("codeEditor.formatSaveTip")}
            >
              {formatOnSave ? <CheckSquare size={12} /> : <Square size={12} />}
              <span>{t("codeEditor.saveFormat")}</span>
            </button>

            <button
              onClick={handleManualFormat}
              disabled={isFormatting}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              title={t("codeEditor.formatCodeTip")}
            >
              <FileJson size={14} />
            </button>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors shadow-sm ${
              showHistory
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
            title={t("codeEditor.historyTip")}
          >
            <History size={14} />
            <span>{t("codeEditor.history")}</span>
          </button>

          <button
            onClick={handleSaveAction}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors shadow-sm active:transform active:scale-95"
            title={t("codeEditor.saveTip")}
          >
            <Save size={14} />
            <span>{t("codeEditor.save")}</span>
          </button>
        </div>
      </div>

      {/* 编辑器内容区域 (包含侧边栏) */}
      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={onChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true, // 关键：自动适应容器大小变化
              scrollBeyondLastLine: false,
              tabSize: 4,
              padding: { top: 10 },
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* 历史记录侧边栏 */}
        {showHistory && (
          <div className="w-64 bg-[#252526] border-l border-[#333] flex flex-col shadow-xl z-10 transition-all">
            <div className="p-3 border-b border-[#333] flex justify-between items-center bg-[#2d2d2d]">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <History size={14} /> {t("codeEditor.versionHistory")}
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {history.length === 0 ? (
                <div className="text-xs text-gray-500 text-center mt-10 whitespace-pre-line">
                  {t("codeEditor.noHistory")}
                </div>
              ) : (
                history.map((ver, index) => (
                  <div
                    key={ver.id}
                    className="bg-[#1e1e1e] p-2 rounded border border-[#333] hover:border-blue-700 group transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-blue-400 font-mono">
                        {new Date(ver.timestamp).toLocaleTimeString()}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded">
                          {t("codeEditor.latest")}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 mb-2 truncate">
                      {new Date(ver.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-gray-600 mb-2 font-mono">
                      {t("codeEditor.fileSize")}: {ver.content.length} {t("codeEditor.characters")}
                    </div>

                    <button
                      onClick={() => onRestore(ver.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1 text-xs bg-[#2d2d2d] hover:bg-red-900/50 text-gray-300 hover:text-red-300 rounded border border-transparent hover:border-red-800 transition-all"
                    >
                      <RotateCcw size={12} />
                      {t("codeEditor.restoreVersion")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
