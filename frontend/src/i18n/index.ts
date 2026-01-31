import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as OpenCC from 'opencc-js';

import zhCN from '../locales/zh-CN.json';
import en from '../locales/en.json';

// 创建简体到繁体转换器 (s2twp: 简体到台湾繁体，带词汇转换)
const converter = OpenCC.Converter({ from: 'cn', to: 'twp' });

// 递归转换对象中的所有字符串
function convertToTraditional(obj: any): any {
  if (typeof obj === 'string') {
    return converter(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertToTraditional);
  }
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertToTraditional(obj[key]);
    }
    return result;
  }
  return obj;
}

// 从简体中文自动生成繁体中文翻译
const zhTW = convertToTraditional(zhCN);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      en: { translation: en },
    },
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'zh-TW', 'en'],

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
