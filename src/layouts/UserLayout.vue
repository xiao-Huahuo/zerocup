<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

    <Sidebar ref="sidebarRef" />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="{ 'lg:ml-64': true }"
    >
      <header class="h-16 shadow-md bg-white dark:bg-gray-800 sticky top-0 z-10 flex items-center justify-between px-4 lg:px-6">

        <button
          id="sidebar-toggle"
          class="lg:hidden text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="toggleSidebar"
        >
          <i class="fa fa-bars text-xl"></i>
        </button>

        <h1 class="text-xl font-semibold text-gray-900 dark:text-white flex-1"
            data-translate-key>{{ t[$route.meta.titleKey] || 'Loading...' }}</h1>

        <div class="flex items-center space-x-4">

          <button @click="toggleTheme" class="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <i class="fa text-xl" :class="settingsStore.currentTheme === 'dark' ? 'fa-sun-o' : 'fa-moon-o'"></i>
          </button>

          <button
            id="feedback-btn"
            @click="promptFeedback"
            class="btn-secondary"
            data-translate-key="feedback_button"
          >
            <i class="fa fa-commenting-o"></i>
            <span class="hidden sm:inline ml-2">{{ t.feedback_button || '用户反馈' }}</span>
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDataStore } from '@/stores/dataStore';
import Sidebar from '@/components/Sidebar.vue';

const settingsStore = useSettingsStore();
const dataStore = useDataStore();
const sidebarRef = ref(null);

const t = computed(() => settingsStore.currentTranslations);

onMounted(() => {
  // 确保应用主题在首次加载时应用
  settingsStore.initializeTheme();
});

const toggleSidebar = () => {
  // 调用子组件 Sidebar 的 toggleSidebar 方法
  sidebarRef.value.toggleSidebar();
};

const toggleTheme = () => {
  const newTheme = settingsStore.currentTheme === 'light' ? 'dark' : 'light';
  settingsStore.setTheme(newTheme);
};

/**
 * 用户反馈逻辑，取代原 user-page.html 中的 prompt/alert 逻辑
 */
const promptFeedback = () => {
  const promptText = t.value.alert_feedback_prompt_placeholder || '请输入您的反馈意见：';
  // 使用原生的 prompt 模拟用户输入体验
  const feedbackTextValue = prompt(promptText, '');

  if (feedbackTextValue === null) {
    // 用户点击取消
    return;
  }

  if (feedbackTextValue.trim() !== '') {
    // 调用 dataStore action 来保存反馈
    dataStore.submitFeedback(feedbackTextValue.trim());
    alert(t.value.alert_feedback_success || '反馈成功!');
  } else {
    alert(t.value.alert_feedback_empty || '未输入内容。');
  }
};


// ‼️ 重要：在 dataStore 中补充 submitFeedback action
// 因为原 user-page.html 逻辑直接操作了 localStorage:
/*
    allFeedback.push({ username: currentUser, date: new Date().toLocaleDateString('zh-CN'), text: feedbackTextValue.trim() });
    localStorage.setItem('userFeedback', JSON.stringify(allFeedback));
*/
// 我们需要在 dataStore 中实现这个逻辑：
// 假设我们在 dataStore.js 中添加了：
/*
    submitFeedback(text) {
        const userStore = useUserStore();
        if (!userStore.currentUser) return;

        this.userFeedback.push({
            username: userStore.currentUser,
            date: new Date().toLocaleDateString('zh-CN'),
            text: text
        });
        localStorage.setItem('userFeedback', JSON.stringify(this.userFeedback));
    }
*/

</script>

<style scoped>
/* 确保 .btn-secondary 样式被定义 */
.btn-secondary {
  /* 临时手动实现原样式 */
  background-color: #C8E6C9; /* tertiary */
  color: #4CAF50; /* accent */
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.dark .btn-secondary {
  background-color: #4CAF50;
  color: white;
}
.btn-secondary:hover {
  background-color: #A5D6A7; /* secondary */
}
.dark .btn-secondary:hover {
  background-color: #81C784; /* primary */
}
</style>
