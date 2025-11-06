// src/stores/settingsStore.js

import { defineStore } from 'pinia';
// 假设您已将 translations.js 的内容复制到 /src/data/translations.js
import { translations } from '@/data/translations.js';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 默认语言：从 localStorage 恢复，否则使用 'zh-CN'
    currentLang: localStorage.getItem('lang') || 'zh-CN',
    // 默认主题：从 localStorage 恢复，否则使用 'light'
    currentTheme: localStorage.getItem('theme') || 'light',
    // 完整的翻译数据
    i18n: translations
  }),

  getters: {
    // 获取当前语言环境下的所有翻译文本
    currentTranslations: (state) => state.i18n[state.currentLang] || state.i18n['zh-CN'],
  },

  actions: {
    /** 切换语言 */
    setLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      // 注意：在 Vue 中切换语言不需要像原生项目那样 location.reload()，
      // 只需要在组件中使用 this.currentTranslations 即可实现响应式更新。
    },

    /** 切换主题 */
    setTheme(theme) {
      this.currentTheme = theme;
      localStorage.setItem('theme', theme);

      // 动态切换 Tailwind CSS 的 dark 类
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    /** 应用初始化时的主题设置 (在 App.vue 的 onMounted 中调用) */
    initializeTheme() {
      this.setTheme(this.currentTheme);
    }
  }
});
