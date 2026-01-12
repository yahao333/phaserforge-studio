import React, { useEffect, useRef, useState } from "react";
import { RotateCw, Play, Zap } from "lucide-react";
import { ProjectFile } from "../types";
import { useI18n } from "../i18nContext";

interface GamePreviewProps {
  files: ProjectFile[]; // 接收文件列表而非拼接后的代码字符串
  onError: (error: string) => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({ files, onError }) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null); // 存储 Phaser.Game 实例引用
  const [isRunning, setIsRunning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 用于手动强制刷新
  const [autoReload, setAutoReload] = useState(true); // 默认开启热重载
  const prevFilesRef = useRef<string>(""); // 用于比较文件内容变化

  // 核心函数：运行游戏
  const runGame = () => {
    if (!containerRef.current) return;

    // 查找入口文件
    const mainFile = files.find((f) => f.name === "main.js");
    if (!mainFile) {
      onError(t("gamePreview.entryFileNotFound"));
      return;
    }

    console.log("[游戏预览] 正在启动游戏实例... (模块化模式)");

    // 1. 彻底清理旧实例
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      } catch (e) {
        console.error("[游戏预览] 销毁失败:", e);
      }
    }

    // 2. 重置 DOM 容器
    containerRef.current.innerHTML = "";
    const gameDiv = document.createElement("div");
    gameDiv.id = "game-container";
    gameDiv.style.width = "100%";
    gameDiv.style.height = "100%";
    containerRef.current.appendChild(gameDiv);

    // 3. 准备执行环境
    try {
      const globalPhaser = (window as any).Phaser;
      if (!globalPhaser) {
        throw new Error(t("gamePreview.phaserEngineNotLoaded"));
      }

      // 劫持 Phaser.Game 构造函数
      let capturedGame: any = null;
      class HijackedGame extends globalPhaser.Game {
        constructor(config: any) {
          const safeConfig = { ...config };
          // 强制指定父容器，防止用户配置错误导致 Canvas 跑到外面
          if (safeConfig.scale) {
            safeConfig.scale.parent = "game-container";
          } else {
            safeConfig.parent = "game-container";
          }
          super(safeConfig);
          capturedGame = this;
          console.log("[游戏预览] Phaser 实例已创建");
        }
      }

      const PhaserProxy = new Proxy(globalPhaser, {
        get: (target, prop) => {
          if (prop === "Game") return HijackedGame;
          return target[prop];
        },
      });

      const customConsole = (window as any).__custom_console__ || console;

      // --- 4. 实现 CommonJS 模块系统 ---
      const moduleCache: Record<string, any> = {};

      const customRequire = (path: string) => {
        // 路径标准化：移除 ./ 前缀
        let targetName = path.replace(/^\.\//, "");

        // 尝试补全后缀
        let targetFile = files.find((f) => f.name === targetName);
        if (!targetFile)
          targetFile = files.find((f) => f.name === targetName + ".js");
        if (!targetFile)
          targetFile = files.find((f) => f.name === targetName + ".json");

        if (!targetFile) {
          throw new Error(`Cannot find module '${path}'`);
        }

        // 检查缓存
        if (moduleCache[targetFile.name]) {
          return moduleCache[targetFile.name].exports;
        }

        // 初始化模块对象
        const module = { exports: {} as any };
        moduleCache[targetFile.name] = module;

        // 处理 JSON 文件
        if (
          targetFile.language === "json" ||
          targetFile.name.endsWith(".json")
        ) {
          try {
            module.exports = JSON.parse(targetFile.content);
          } catch (e) {
            throw new Error(
              `Failed to parse JSON module '${targetName}': ${e}`,
            );
          }
          return module.exports;
        }

        // 执行 JS 模块
        try {
          const wrapper = new Function(
            "require",
            "module",
            "exports",
            "console",
            "Phaser",
            `${targetFile.content}\n//# sourceURL=${targetFile.name}`,
          );

          wrapper(
            customRequire,
            module,
            module.exports,
            customConsole,
            PhaserProxy,
          );
        } catch (e: any) {
          throw new Error(
            `Error executing module '${targetName}': ${e.message}`,
          );
        }

        // --- 增强：自动为 Phaser Scene 添加错误边界 ---
        // 如果导出的是一个类，并且继承自 Phaser.Scene，我们劫持它的生命周期方法以捕获运行时错误
        if (module.exports && typeof module.exports === "function") {
          // 检查原型链是否包含 Phaser.Scene
          // 注意：这里使用 globalPhaser 而不是 Proxy，确保 instanceof 检查正确
          if (
            globalPhaser.Scene &&
            module.exports.prototype instanceof globalPhaser.Scene
          ) {
            const className = module.exports.name || targetName;
            const methodsToWrap = ["init", "preload", "create", "update"];

            methodsToWrap.forEach((method) => {
              if (typeof module.exports.prototype[method] === "function") {
                const originalMethod = module.exports.prototype[method];

                module.exports.prototype[method] = function (...args: any[]) {
                  try {
                    return originalMethod.apply(this, args);
                  } catch (err: any) {
                    const errorMsg = `[Runtime Error] ${className}.${method}(): ${err.message}`;

                    // 1. 输出到控制台
                    customConsole.error(errorMsg, err);

                    // 2. 通知 UI
                    onError(errorMsg);

                    // 3. 紧急处理：如果是在 update 中报错，通常会无限循环，所以尝试暂停场景
                    if (this.scene && typeof this.scene.pause === "function") {
                      try {
                        this.scene.pause();
                        customConsole.warn(
                          t("gamePreview.scenePausedProtection").replace(
                            "{scene}",
                            className,
                          ),
                        );
                      } catch (pauseErr) {
                        // 忽略暂停失败
                      }
                    }

                    // 抛出错误以便中断当前帧的后续逻辑
                    throw err;
                  }
                };
              }
            });
            console.log(`[系统] 已为场景 '${className}' 注入运行时错误保护。`);
          }
        }

        return module.exports;
      };

      // 5. 启动入口文件
      customRequire("main.js");

      // 6. 验证启动结果
      if (capturedGame) {
        gameInstanceRef.current = capturedGame;
        setIsRunning(true);
      } else {
        // 异步创建或仅 Canvas 存在的情况
        setTimeout(() => {
          if (containerRef.current?.querySelector("canvas")) {
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("[游戏预览] 初始化/编译错误:", err);
      // 确保错误信息显示在 UI 上
      onError(
        t("gamePreview.startupFailed").replace(
          "{error}",
          err.message || String(err),
        ),
      );
      setIsRunning(false);
    }
  };

  // 监听文件变化实现热重载
  useEffect(() => {
    // 创建一个简单的指纹来检测内容变化
    const currentFilesFingerprint = JSON.stringify(
      files.map((f) => ({ n: f.name, c: f.content })),
    );

    if (currentFilesFingerprint === prevFilesRef.current) {
      return;
    }
    prevFilesRef.current = currentFilesFingerprint;

    if (autoReload || refreshKey > 0) {
      const timer = setTimeout(() => {
        runGame();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [files, refreshKey, autoReload]);

  const handleManualReload = () => {
    console.log("[游戏预览] 用户触发手动重载");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-gray-400 text-xs flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            {t("gamePreview.canvasContainer")}
          </div>

          {/* 热重载开关 */}
          <button
            onClick={() => setAutoReload(!autoReload)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors border ${
              autoReload
                ? "bg-yellow-900/30 border-yellow-700 text-yellow-500"
                : "bg-gray-800 border-gray-600 text-gray-500"
            }`}
            title={
              autoReload
                ? t("gamePreview.hotReloadOnTip")
                : t("gamePreview.hotReloadOffTip")
            }
          >
            <Zap size={10} className={autoReload ? "fill-current" : ""} />
            <span>
              {autoReload
                ? t("gamePreview.hotReloadOn")
                : t("gamePreview.hotReloadOff")}
            </span>
          </button>
        </div>

        <button
          onClick={handleManualReload}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
          title={t("gamePreview.forceRerun")}
        >
          <RotateCw size={12} />
          <span>{t("gamePreview.reloadRun")}</span>
        </button>
      </div>

      {/* 游戏画布容器 */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#111]">
        <div ref={containerRef} className="w-full h-full" />

        {/* 状态提示 */}
        {!isRunning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-gray-600 flex flex-col items-center bg-black/50 p-4 rounded-lg backdrop-blur-sm">
              <Play size={32} className="mb-2 opacity-50" />
              <span className="text-xs">{t("gamePreview.waitingForCode")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePreview;
