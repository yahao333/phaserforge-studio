/**
 * English Language Configuration File
 *
 * This file contains all text content in the application that needs internationalization (English version)
 *
 * Usage:
 * import { translations } from './i18n';
 * const text = translations.en.common.appName;
 */

export const en = {
  // --- Common Text ---
  common: {
    appName: "PhaserForge Studio",
    phaserVersion: "Phaser v3.60.0",
    editing: "Editing:",
    noFileSelected: "No file selected",
    language: "Language",
    english: "English",
  },

  // --- Window Panel ---
  windowPanel: {
    close: "Close Window",
    minimize: "Minimize",
    maximize: "Maximize",
    dragToMove: "Drag to move window",
  },

  // --- Status Bar ---
  statusBar: {
    explorer: "Explorer",
    editor: "Code Editor",
    preview: "Game Preview",
    console: "Console",
  },

  // --- File Explorer ---
  fileExplorer: {
    title: "Project Files",
    searchPlaceholder: "Search files...",
    noFiles: "No files yet. Create or upload one.",
    noMatchingFiles: "No matching files found",
    newFile: "New File",
    uploadFile: "Upload File",
    download: "Download",
    rename: "Rename",
    delete: "Delete",
    deleteConfirm:
      "Are you sure you want to delete {name}? This action cannot be undone.",
    creatingFile: "Creating new file...",
    renaming: "Renaming file...",
    defaultFileName: "newScript.js",
    placeholder: "filename.js",
  },

  // --- Code Editor ---
  codeEditor: {
    save: "Save",
    history: "History",
    versionHistory: "Version History",
    noHistory: 'No history versions yet\nClick "Save" to create a version',
    saveFormat: "Format on Save",
    formatCode: "Format Code",
    formatSaveTip: "Enable/Disable format on save",
    formatCodeTip: "Format code (Shift+Alt+F)",
    historyTip: "View version history",
    saveTip: "Save file and create version (Ctrl+S)",
    latest: "Latest",
    restoreVersion: "Restore this version",
    fileSize: "Size",
    characters: "characters",
    noFileSelected: "Please select a file in the explorer",
    formatSuccess: "Format successful",
    formatFailed: "Format failed",
    editorLoaded: "Monaco Editor loaded",
    saveShortcutTriggered: "Save shortcut triggered",
  },

  // --- Game Preview ---
  gamePreview: {
    title: "Game Preview",
    loading: "Loading...",
    error: "Preview Error",
    reload: "Reload",
    fullscreen: "Fullscreen",
    fullscreenTip: "Enter/Exit fullscreen mode",
    gameReady: "Game ready",
    gameError: "Game runtime error",
    canvasContainer: "Canvas Container",
    hotReloadOn: "Hot Reload On",
    hotReloadOff: "Hot Reload Off",
    hotReloadOnTip: "Hot Reload On: Auto-refresh after save",
    hotReloadOffTip: "Hot Reload Off",
    forceRerun: "Force Rerun",
    reloadRun: "Reload / Run",
    waitingForCode: "Waiting for code execution...",
    entryFileNotFound: "Cannot find entry file 'main.js'",
    phaserEngineNotLoaded:
      "Phaser engine not loaded, please check network connection.",
    startupFailed: "Startup failed: {error}",
    scenePausedProtection:
      "[System Protection] Error detected. Scene '{scene}' was paused automatically.",
  },

  // --- Console ---
  console: {
    title: "Console",
    clear: "Clear",
    clearTip: "Clear console",
    searchPlaceholder: "Search logs...",
    showHide: "Show/Hide",
    errors: "Errors",
    warnings: "Warnings",
    info: "Info",
    logs: "Logs",
    noLogs: "No log output yet...",
    logsHidden: "Logs hidden (check filters)",
    noMatchingLogs: 'No logs containing "{query}" found',
    toggleFilter: "Toggle filter",
    logType: "Log type",
    showHideErrors: "Show/Hide Errors",
    showHideWarnings: "Show/Hide Warnings",
    showHideInfo: "Show/Hide Info",
    showHideLogs: "Show/Hide Logs",
    noLogsFound: "No log output yet...",
    logsHiddenCheckFilters: "Logs hidden (check filters)",
    noMatchingLogsWithQuery: 'No logs containing "{query}" found',
  },

  // --- Language Switcher ---
  languageSwitcher: {
    switch: "Switch Language",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    languageChanged: "Language changed to:",
    currentLanguage: "Current language:",
  },

  // --- System Messages ---
  system: {
    initializing: "Initializing application...",
    appMounted: "Application mounted successfully",
    rootElementNotFound: "Root element not found!",
    creatingFile: "Creating new file:",
    uploadingFile: "Uploading file:",
    renamingFile: "Starting rename:",
    togglingWindow: "Toggling window visibility:",
    closingWindow: "Closing window:",
    focusingWindow: "Focusing window:",
  },
};
