/**
 * 中文语言配置文件
 *
 * 这个文件包含了应用程序中所有需要国际化的文本内容（中文版本）
 *
 * 使用方法：
 * import { translations } from './i18n';
 * const text = translations.zh.common.appName;
 */

export const zh = {
  // --- 通用文本 ---
  common: {
    appName: "PhaserForge Studio",
    phaserVersion: "Phaser v3.60.0",
    editing: "编辑中：",
    noFileSelected: "未选择文件",
    language: "中文",
    english: "英文",
  },

  // --- 窗口面板 ---
  windowPanel: {
    close: "关闭窗口",
    minimize: "最小化",
    maximize: "最大化",
    dragToMove: "拖动移动窗口",
  },

  // --- 底部状态栏 ---
  statusBar: {
    explorer: "资源管理器",
    editor: "代码编辑器",
    preview: "游戏预览",
    console: "控制台",
  },

  // --- 文件管理器 ---
  fileExplorer: {
    title: "项目文件",
    searchPlaceholder: "搜索文件...",
    noFiles: "暂无文件，请创建或上传",
    noMatchingFiles: "未找到匹配文件",
    newFile: "新建文件",
    uploadFile: "上传文件",
    download: "下载",
    rename: "重命名",
    delete: "删除",
    deleteConfirm: "确定要删除 {name} 吗？此操作无法撤销。",
    creatingFile: "创建新文件...",
    renaming: "重命名文件...",
    defaultFileName: "newScript.js",
    placeholder: "filename.js",
  },

  // --- 代码编辑器 ---
  codeEditor: {
    save: "保存",
    history: "历史",
    versionHistory: "版本历史",
    noHistory: '暂无历史版本\n点击"保存"创建版本',
    saveFormat: "保存时自动格式化",
    formatCode: "格式化代码",
    formatSaveTip: "开启/关闭 保存时自动格式化",
    formatCodeTip: "格式化代码 (Shift+Alt+F)",
    historyTip: "查看版本历史",
    saveTip: "保存文件并创建版本 (Ctrl+S)",
    latest: "最新",
    restoreVersion: "恢复此版本",
    fileSize: "大小",
    characters: "字符",
    noFileSelected: "请在资源管理器中选择一个文件",
    formatSuccess: "格式化成功",
    formatFailed: "格式化失败",
    editorLoaded: "Monaco Editor 已加载",
    saveShortcutTriggered: "触发保存快捷键",
  },

  // --- 游戏预览 ---
  gamePreview: {
    title: "游戏预览",
    loading: "加载中...",
    error: "预览出错",
    reload: "重新加载",
    fullscreen: "全屏",
    fullscreenTip: "进入/退出全屏模式",
    gameReady: "游戏准备就绪",
    gameError: "游戏运行错误",
    canvasContainer: "Canvas 容器",
    hotReloadOn: "热重载已开启",
    hotReloadOff: "热重载已关闭",
    hotReloadOnTip: "热重载已开启：保存代码后自动刷新",
    hotReloadOffTip: "热重载已关闭",
    forceRerun: "强制重新运行",
    reloadRun: "重载 / 运行",
    waitingForCode: "等待代码执行...",
    entryFileNotFound: "找不到入口文件 'main.js'",
    phaserEngineNotLoaded: "Phaser 引擎未加载，请检查网络连接。",
    startupFailed: "启动失败: {error}",
    scenePausedProtection: "[系统保护] 由于检测到错误，场景 '{scene}' 已被自动暂停。",
  },

  // --- 控制台 ---
  console: {
    title: "控制台",
    clear: "清空",
    clearTip: "清空控制台",
    searchPlaceholder: "搜索日志...",
    showHide: "显示/隐藏",
    errors: "错误",
    warnings: "警告",
    info: "信息",
    logs: "普通日志",
    noLogs: "暂无日志输出...",
    logsHidden: "日志已隐藏 (请检查过滤器)",
    noMatchingLogs: '未找到包含 "{query}" 的日志',
    toggleFilter: "切换过滤",
    logType: "日志类型",
    showHideErrors: "显示/隐藏 错误",
    showHideWarnings: "显示/隐藏 警告",
    showHideInfo: "显示/隐藏 信息",
    showHideLogs: "显示/隐藏 普通日志",
    noLogsFound: "暂无日志输出...",
    logsHiddenCheckFilters: "日志已隐藏 (请检查过滤器)",
    noMatchingLogsWithQuery: '未找到包含 "{query}" 的日志',
  },

  // --- 语言切换 ---
  languageSwitcher: {
    switch: "切换语言",
    switchToEnglish: "切换到英文",
    switchToChinese: "切换到中文",
    languageChanged: "语言已切换为：",
    currentLanguage: "当前语言：",
  },

  // --- 系统消息 ---
  system: {
    initializing: "正在初始化应用...",
    appMounted: "应用挂载完成",
    rootElementNotFound: "找不到 root 元素！",
    creatingFile: "创建新文件：",
    uploadingFile: "上传文件：",
    renamingFile: "开始重命名：",
    togglingWindow: "切换窗口显示：",
    closingWindow: "关闭窗口：",
    focusingWindow: "聚焦窗口：",
  },
};
