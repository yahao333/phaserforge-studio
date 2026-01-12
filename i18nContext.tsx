/**
 * 国际化 (i18n) Context 和 Provider
 *
 * 这个文件提供了语言切换的核心功能：
 * 1. I18nContext - 上下文对象，存储当前语言和翻译函数
 * 2. I18nProvider - 提供者组件，包裹整个应用
 * 3. useI18n - 自定义 Hook，在组件中获取翻译函数
 *
 * 使用方法：
 * 1. 在应用顶层使用 I18nProvider 包裹
 * 2. 在组件中使用 useI18n() hook 获取翻译函数
 * 3. 使用 t('key.path') 获取对应的翻译文本
 *
 * 示例：
 * const { t, language, setLanguage } = useI18n();
 * <span>{t('common.appName')}</span>
 * <button onClick={() => setLanguage('en')}>Switch to English</button>
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Language, Translations, translations, defaultLanguage } from "./i18n";

// --- 类型定义 ---

// I18n 上下文的值类型
interface I18nContextValue {
  // 当前语言
  language: Language;
  // 翻译函数
  t: (key: keyof Translations | string) => string;
  // 设置语言函数
  setLanguage: (lang: Language) => void;
  // 切换语言函数（在中英文之间切换）
  toggleLanguage: () => void;
}

// --- Context 创建 ---

// 创建 I18n 上下文，默认值为 undefined（确保必须使用 Provider）
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// --- Provider 组件 ---

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

/**
 * 国际化提供者组件
 *
 * 功能：
 * 1. 管理当前语言状态
 * 2. 持久化语言设置到 localStorage
 * 3. 提供翻译函数给所有子组件
 *
 * @param children - 子组件
 * @param initialLanguage - 初始语言（可选，默认为中文）
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLanguage,
}) => {
  console.log("[I18nProvider] 初始化国际化提供者...");

  // 从 localStorage 读取保存的语言设置，如果没有则使用默认语言或传入的初始语言
  const [language, setLanguageState] = useState<Language>(() => {
    console.log("[I18nProvider] 从 localStorage 读取语言设置...");
    const savedLanguage = localStorage.getItem(
      "phaserforge-language",
    ) as Language;

    if (savedLanguage && (savedLanguage === "zh" || savedLanguage === "en")) {
      console.log(`[I18nProvider] 找到保存的语言设置: ${savedLanguage}`);
      return savedLanguage;
    }

    // 如果没有保存的设置，使用传入的初始语言或默认语言
    const lang = initialLanguage || defaultLanguage;
    console.log(`[I18nProvider] 使用初始语言: ${lang}`);
    return lang;
  });

  // --- 核心功能函数 ---

  /**
   * 翻译函数
   * 根据当前语言返回对应的翻译文本
   *
   * @param key - 翻译键，支持点号分隔的路径（如 'common.appName'）
   * @returns 翻译后的文本
   */
  const t = useCallback(
    (key: string): string => {
      // 获取当前语言的翻译数据
      const currentTranslations = translations[language];

      // 如果键中包含点号，需要按路径访问嵌套对象
      const keys = key.split(".");
      let value: any = currentTranslations;

      console.log(`[I18n] 获取翻译: key="${key}", language="${language}"`);

      // 逐级访问嵌套对象
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // 如果找不到对应的键，返回键名本身作为降级处理
          console.warn(`[I18n] 未找到翻译键: ${key}`);
          return key;
        }
      }

      // 确保返回的是字符串
      if (typeof value === "string") {
        return value;
      }

      // 如果不是字符串，返回键名
      console.warn(`[I18n] 翻译值不是字符串: ${key} = ${value}`);
      return key;
    },
    [language],
  );

  /**
   * 设置语言函数
   * 更新当前语言并持久化到 localStorage
   *
   * @param lang - 要设置的语言
   */
  const setLanguage = useCallback(
    (lang: Language) => {
      console.log(`[I18n] 切换语言: ${language} -> ${lang}`);

      // 更新状态
      setLanguageState(lang);

      // 保存到 localStorage
      localStorage.setItem("phaserforge-language", lang);

      // 设置文档的 lang 属性
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

      console.log(`[I18n] 语言已切换为: ${lang}`);
    },
    [language],
  );

  /**
   * 切换语言函数
   * 在中英文之间快速切换
   */
  const toggleLanguage = useCallback(() => {
    const newLanguage: Language = language === "zh" ? "en" : "zh";
    console.log(`[I18n] 快速切换语言: ${language} -> ${newLanguage}`);
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  // 初始化时设置文档的 lang 属性
  useEffect(() => {
    console.log(
      `[I18n] 初始化文档语言属性: ${language === "zh" ? "zh-CN" : "en"}`,
    );
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  // 创建上下文值对象
  const contextValue: I18nContextValue = {
    language,
    t,
    setLanguage,
    toggleLanguage,
  };

  console.log("[I18nProvider] 国际化提供者初始化完成");

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

// --- 自定义 Hook ---

/**
 * 使用国际化的 Hook
 *
 * 必须在 I18nProvider 内部使用
 *
 * @returns I18n 上下文值（language, t, setLanguage, toggleLanguage）
 *
 * @throws 如果在 Provider 外部使用会抛出错误
 */
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (context === undefined) {
    throw new Error(
      "[I18n] useI18n 必须在 I18nProvider 内部使用！请确保在应用顶层使用 I18nProvider 包裹。",
    );
  }

  return context;
};
