import React, { useEffect, useRef, useState } from "react";
import { LogEntry, LogType } from "../types";
import {
  Ban,
  AlertCircle,
  AlertTriangle,
  Info,
  Terminal,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useI18n } from "../i18nContext";

interface ConsolePanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs, onClear }) => {
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 过滤状态：默认全部开启
  const [filters, setFilters] = useState<Record<LogType, boolean>>({
    error: true,
    warn: true,
    info: true,
    log: true,
  });

  // 搜索关键词状态
  const [searchQuery, setSearchQuery] = useState("");

  // 切换过滤状态
  const toggleFilter = (type: LogType) => {
    setFilters((prev) => {
      const newState = { ...prev, [type]: !prev[type] };
      console.log(
        `[Console] ${t("console.toggleFilter")}: ${type} -> ${newState[type]}`,
      );
      return newState;
    });
  };

  // 计算过滤后的日志列表
  const filteredLogs = logs.filter((log) => {
    // 1. 类型过滤
    if (!filters[log.type]) return false;

    // 2. 关键词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const messageMatch = log.message.toLowerCase().includes(query);
      // 搜索参数
      const argsMatch =
        log.args &&
        log.args.some((arg) => {
          try {
            const str =
              typeof arg === "object" ? JSON.stringify(arg) : String(arg);
            return str.toLowerCase().includes(query);
          } catch (e) {
            return false;
          }
        });
      return messageMatch || argsMatch;
    }

    return true;
  });

  // 自动滚动到底部 (依赖 filteredLogs 长度变化)
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs.length, filters, searchQuery]); // 当日志数量变化或过滤器变化时滚动

  const getLogColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400 bg-red-900/10 border-l-2 border-red-500";
      case "warn":
        return "text-yellow-400 bg-yellow-900/10 border-l-2 border-yellow-500";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-xs font-mono">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-1.5 bg-[#161b22] border-b border-gray-800 shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-1 text-gray-400 font-semibold select-none flex items-center gap-1 shrink-0">
            <Terminal size={12} />
            <span className="hidden sm:inline">{t("console.title")}</span>(
            {logs.length})
          </span>

          {/* 过滤器按钮组 */}
          <div className="flex items-center bg-[#0d1117] rounded border border-gray-700 p-0.5 shrink-0">
            <Filter size={10} className="text-gray-500 mx-1.5" />

            {/* Error Filter */}
            <button
              onClick={() => toggleFilter("error")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                filters.error
                  ? "bg-red-900/30 text-red-400"
                  : "text-gray-600 hover:text-gray-400"
              }`}
              title={t("console.showHideErrors")}
            >
              <AlertCircle size={10} />
              <span className="hidden xl:inline">{t("console.errors")}</span>
            </button>

            {/* Warn Filter */}
            <button
              onClick={() => toggleFilter("warn")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ml-0.5 ${
                filters.warn
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "text-gray-600 hover:text-gray-400"
              }`}
              title={t("console.showHideWarnings")}
            >
              <AlertTriangle size={10} />
              <span className="hidden xl:inline">{t("console.warnings")}</span>
            </button>

            {/* Info Filter */}
            <button
              onClick={() => toggleFilter("info")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ml-0.5 ${
                filters.info
                  ? "bg-blue-900/30 text-blue-400"
                  : "text-gray-600 hover:text-gray-400"
              }`}
              title={t("console.showHideInfo")}
            >
              <Info size={10} />
              <span className="hidden xl:inline">{t("console.info")}</span>
            </button>

            {/* Log Filter */}
            <button
              onClick={() => toggleFilter("log")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ml-0.5 ${
                filters.log
                  ? "bg-gray-700 text-gray-200"
                  : "text-gray-600 hover:text-gray-400"
              }`}
              title={t("console.showHideLogs")}
            >
              <Terminal size={10} />
              <span className="hidden xl:inline">{t("console.logs")}</span>
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative flex-1 max-w-[150px] group">
            <Search
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={10}
            />
            <input
              type="text"
              placeholder={t("console.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] text-gray-300 text-[10px] rounded border border-gray-700 pl-5 pr-5 py-0.5 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors shrink-0"
          title={t("console.clearTip")}
        >
          <Ban size={12} />
          <span className="hidden sm:inline">{t("console.clear")}</span>
        </button>
      </div>

      {/* 日志内容 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-600 italic px-2 mt-2 text-center opacity-50">
            {logs.length > 0
              ? searchQuery
                ? t("console.noMatchingLogsWithQuery").replace(
                    "{query}",
                    searchQuery,
                  )
                : t("console.logsHidden")
              : t("console.noLogsFound")}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-1 break-words rounded-sm ${getLogColor(log.type)}`}
            >
              <div className="flex items-start">
                <span className="opacity-50 mr-2 text-[10px] mt-0.5 shrink-0 select-none">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <div className="flex-1">
                  <span>{log.message}</span>
                  {/* 渲染额外的参数，如果是对象则格式化显示 */}
                  {log.args && log.args.length > 0 && (
                    <div className="pl-0 mt-1 opacity-90 overflow-x-auto">
                      {log.args.map((arg, i) => (
                        <div
                          key={i}
                          className="inline-block mr-2 text-[10px] bg-black/20 p-1 rounded font-mono border border-white/5 align-top max-w-full overflow-hidden"
                        >
                          {typeof arg === "object" ? (
                            <pre className="m-0">
                              {JSON.stringify(arg, null, 2)}
                            </pre>
                          ) : (
                            String(arg)
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ConsolePanel;
