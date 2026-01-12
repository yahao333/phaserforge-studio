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
  const gameInstanceRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoReload, setAutoReload] = useState(true);
  const prevFilesRef = useRef<string>("");
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const [phaserLoadError, setPhaserLoadError] = useState<string | null>(null);

  useEffect(() => {
    const checkPhaser = () => {
      if ((window as any).Phaser) {
        setPhaserLoaded(true);
        setPhaserLoadError(null);
      } else {
        setPhaserLoaded(false);
        setPhaserLoadError(t("gamePreview.phaserEngineNotLoaded"));
      }
    };

    checkPhaser();
    const interval = setInterval(checkPhaser, 1000);
    return () => clearInterval(interval);
  }, [t]);

  const handleLoadPhaser = async () => {
    setPhaserLoadError(t("gamePreview.loading"));
    try {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js";
      script.onload = () => {
        setPhaserLoaded(true);
        setPhaserLoadError(null);
        console.log("[游戏预览] Phaser 引擎已手动加载");
      };
      script.onerror = () => {
        setPhaserLoadError(t("gamePreview.phaserEngineNotLoaded"));
      };
      document.head.appendChild(script);
    } catch (e: any) {
      setPhaserLoadError(e.message || "Failed to load Phaser");
    }
  };

  const runGame = () => {
    if (!containerRef.current) return;

    const globalPhaser = (window as any).Phaser;
    if (!globalPhaser) {
      onError(t("gamePreview.phaserEngineNotLoaded"));
      setPhaserLoadError(t("gamePreview.phaserEngineNotLoaded"));
      return;
    }

    const mainFile = files.find(
      (f) => f.name === "main.ts" || f.name === "main.js",
    );
    if (!mainFile) {
      onError(t("gamePreview.entryFileNotFound"));
      return;
    }

    console.log("[游戏预览] 正在启动游戏实例... (TypeScript 模块化模式)");

    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      } catch (e) {
        console.error("[游戏预览] 销毁失败:", e);
      }
    }

    containerRef.current.innerHTML = "";
    const gameDiv = document.createElement("div");
    gameDiv.id = "game-container";
    gameDiv.style.width = "100%";
    gameDiv.style.height = "100%";
    containerRef.current.appendChild(gameDiv);

    try {
      const globalPhaser = (window as any).Phaser;
      if (!globalPhaser) {
        throw new Error(t("gamePreview.phaserEngineNotLoaded"));
      }

      let capturedGame: any = null;
      class HijackedGame extends globalPhaser.Game {
        constructor(config: any) {
          const safeConfig = { ...config };
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

      const moduleCache: Record<string, any> = {};

      const stripTypeAnnotations = (code: string): string => {
        let result = code;

        result = result.replace(/:\s*\w+(\[\])?(\s*\|\s*\w+)*/g, "");
        result = result.replace(/<\w+(\[\])?(\s*,\s*\w+)*>/g, "");
        result = result.replace(/\s+as\s+\w+/g, "");
        result = result.replace(/public\s+/g, "");
        result = result.replace(/private\s+/g, "");
        result = result.replace(/protected\s+/g, "");
        result = result.replace(/readonly\s+/g, "");
        result = result.replace(/abstract\s+/g, "");
        result = result.replace(/implements\s+\w+(\s*,\s*\w+)*/g, "");
        result = result.replace(/extends\s+\w+(\s*\.\s*\w+)*/g, "");
        result = result.replace(/:\s*void/g, "");
        result = result.replace(/:\s*any\b/g, "");
        result = result.replace(/export\s+class\s+/g, "class ");
        result = result.replace(/export\s+function\s+/g, "function ");
        result = result.replace(/export\s+const\s+/g, "const ");
        result = result.replace(/export\s+let\s+/g, "let ");
        result = result.replace(/export\s+var\s+/g, "var ");
        result = result.replace(/export\s+default\s+/g, "");
        result = result.replace(/export\s+\{/g, "{");

        return result;
      };

      const convertImportsToRequires = (code: string): string => {
        let result = code;
        result = result.replace(
          /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]([^'"]+)['"]\s*;?/g,
          (match, p1, p2) => `const { ${p1} } = require("${p2}");`,
        );
        result = result.replace(
          /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
          (match, p1, p2) => `const ${p1} = require("${p2}");`,
        );
        result = result.replace(
          /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
          (match, p1, p2) => `const ${p1} = require("${p2}");`,
        );
        return result;
      };

      const convertToCommonJS = (code: string): string => {
        let result = code;

        result = result.replace(
          /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
          'const {$1} = require("$2")',
        );

        result = result.replace(
          /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
          'const $1 = require("$2")',
        );

        result = result.replace(
          /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
          'const $1 = require("$2")',
        );

        result = result.replace(
          /export\s+default\s+(class|function|const|let|var)?\s*(\w+)/g,
          "const $2 = $1 ? $1 : class/function extends Object {}",
        );

        result = result.replace(
          /export\s+(class|function|const|let|var)\s+(\w+)/g,
          "$1 $2",
        );

        result = result.replace(/export\s+\{/g, "");
        result = result.replace(/\}\s*;/g, ";");

        result = result.replace(
          /module\.exports\s*=\s*/g,
          "window.__phaser_module__ = ",
        );
        result = result.replace(
          /(const|let|var)\s+(\w+)\s*=\s*module\.exports/g,
          "$1 $2 = window.__phaser_module__",
        );

        return result;
      };

      const customRequire = (path: string) => {
        let targetName = path.replace(/^\.\//, "");

        const searchExtensions = [".ts", ".tsx", ".js", ".json"];
        let targetFile = files.find((f) => f.name === targetName);

        if (!targetFile) {
          for (const ext of searchExtensions) {
            const found = files.find((f) => f.name === targetName + ext);
            if (found) {
              targetFile = found;
              break;
            }
          }
        }

        if (!targetFile) {
          throw new Error(`Cannot find module '${path}'`);
        }

        if (moduleCache[targetFile.name]) {
          return moduleCache[targetFile.name].exports;
        }

        const module = { exports: {} as any };
        moduleCache[targetFile.name] = module;

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

        try {
          let processedCode = targetFile.content;

          const hasTypeAnnotations =
            /(?:^|[=:(]\s*|function\s+\w+\s*\()\s*:\s*\w+/.test(processedCode);

          const hasES6Imports =
            /import\s+.*\s+from\s+['"]|export\s+(class|function|const|let|var|default)/.test(
              processedCode,
            );

          if (hasTypeAnnotations || hasES6Imports) {
            processedCode = stripTypeAnnotations(processedCode);
            processedCode = convertImportsToRequires(processedCode);
          }

          const wrapper = new Function(
            "require",
            "module",
            "exports",
            "console",
            "Phaser",
            `${processedCode}\n//# sourceURL=${targetFile.name}`,
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

        if (module.exports && typeof module.exports === "function") {
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

                    customConsole.error(errorMsg, err);
                    onError(errorMsg);

                    if (this.scene && typeof this.scene.pause === "function") {
                      try {
                        this.scene.pause();
                        customConsole.warn(
                          t("gamePreview.scenePausedProtection").replace(
                            "{scene}",
                            className,
                          ),
                        );
                      } catch (pauseErr) {}
                    }

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

      const entryFileName = mainFile.name.replace(/\.(ts|js)$/, "");
      const entryPath = mainFile.name.endsWith(".ts") ? "./main" : "./main.js";
      customRequire(entryPath);

      if (capturedGame) {
        gameInstanceRef.current = capturedGame;
        setIsRunning(true);
      } else {
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
    if (!phaserLoaded) return;

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
  }, [files, refreshKey, autoReload, phaserLoaded]);

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

        {!phaserLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-red-400 flex flex-col items-center bg-black/80 p-6 rounded-lg backdrop-blur-sm border border-red-800">
              <Play size={32} className="mb-2 opacity-50" />
              <span className="text-sm mb-3">
                {phaserLoadError || t("gamePreview.phaserEngineNotLoaded")}
              </span>
              <button
                onClick={handleLoadPhaser}
                className="pointer-events-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
              >
                {t("gamePreview.reload")}
              </button>
            </div>
          </div>
        )}

        {!isRunning && phaserLoaded && (
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
