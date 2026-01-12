/**
 * 国际化 (i18n) 主入口文件
 *
 * 这个文件导出了所有的语言配置和类型定义
 *
 * 使用说明：
 * 1. 在应用顶层使用 I18nProvider 包裹
 * 2. 在组件中使用 useI18n() hook 获取翻译函数
 *
 * 示例：
 * const { t } = useI18n();
 * <span>{t('common.appName')}</span>
 */

import { zh } from "./zh";
import { en } from "./en";

// 支持的语言类型
export type Language = "zh" | "en";

// 翻译数据的类型定义
export interface Translations {
  common: {
    appName: string;
    phaserVersion: string;
    editing: string;
    noFileSelected: string;
    language: string;
    english: string;
  };
  windowPanel: {
    close: string;
    minimize: string;
    maximize: string;
    dragToMove: string;
  };
  statusBar: {
    explorer: string;
    editor: string;
    preview: string;
    console: string;
  };
  fileExplorer: {
    title: string;
    searchPlaceholder: string;
    noFiles: string;
    noMatchingFiles: string;
    newFile: string;
    uploadFile: string;
    download: string;
    rename: string;
    delete: string;
    deleteConfirm: string;
    creatingFile: string;
    renaming: string;
    defaultFileName: string;
    placeholder: string;
  };
  codeEditor: {
    save: string;
    history: string;
    versionHistory: string;
    noHistory: string;
    saveFormat: string;
    formatCode: string;
    formatSaveTip: string;
    formatCodeTip: string;
    historyTip: string;
    saveTip: string;
    latest: string;
    restoreVersion: string;
    fileSize: string;
    characters: string;
    noFileSelected: string;
    formatSuccess: string;
    formatFailed: string;
    editorLoaded: string;
    saveShortcutTriggered: string;
  };
  gamePreview: {
    title: string;
    loading: string;
    error: string;
    reload: string;
    fullscreen: string;
    fullscreenTip: string;
    gameReady: string;
    gameError: string;
    canvasContainer: string;
    hotReloadOn: string;
    hotReloadOff: string;
    hotReloadOnTip: string;
    hotReloadOffTip: string;
    forceRerun: string;
    reloadRun: string;
    waitingForCode: string;
  };
  console: {
    title: string;
    clear: string;
    clearTip: string;
    searchPlaceholder: string;
    showHide: string;
    errors: string;
    warnings: string;
    info: string;
    logs: string;
    noLogs: string;
    logsHidden: string;
    noMatchingLogs: string;
    toggleFilter: string;
    logType: string;
    showHideErrors: string;
    showHideWarnings: string;
    showHideInfo: string;
    showHideLogs: string;
    noLogsFound: string;
    logsHiddenCheckFilters: string;
    noMatchingLogsWithQuery: string;
  };
  languageSwitcher: {
    switch: string;
    switchToEnglish: string;
    switchToChinese: string;
    languageChanged: string;
    currentLanguage: string;
  };
  system: {
    initializing: string;
    appMounted: string;
    rootElementNotFound: string;
    creatingFile: string;
    uploadingFile: string;
    renamingFile: string;
    togglingWindow: string;
    closingWindow: string;
    focusingWindow: string;
  };
}

// 所有语言的映射表
export const translations: Record<Language, Translations> = {
  zh,
  en,
};

// 默认语言（英文）
export const defaultLanguage: Language = "en";

// 支持的语言列表
export const supportedLanguages: Language[] = ["zh", "en"];
