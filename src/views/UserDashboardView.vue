<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <span data-translate-key="dashboard_welcome_hello">{{ t.dashboard_welcome_hello || '欢迎回来' }}</span>,
        <span class="text-accent">{{ userStore.userInfo.name }}</span>！
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        <span data-translate-key="dashboard_status_current_role">{{ t.dashboard_status_current_role || '您当前的身份是' }}</span>:
        <span class="font-semibold">{{ userStore.userInfo.role }}</span>
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="stat-card bg-primary/10 dark:bg-primary/20 border-l-4 border-primary">
        <div class="text-2xl font-bold text-primary dark:text-white">{{ currentBorrowingsCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_borrowing">{{ t.stat_borrowing || '借阅中' }}</p>
      </div>

      <div class="stat-card bg-accent/10 dark:bg-accent/20 border-l-4 border-accent">
        <div class="text-2xl font-bold text-accent dark:text-white">{{ totalCollectionsCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_collections">{{ t.stat_collections || '我的收藏' }}</p>
      </div>

      <div class="stat-card bg-tertiary/10 dark:bg-tertiary/20 border-l-4 border-tertiary">
        <div class="text-2xl font-bold text-tertiary dark:text-white">{{ totalBooksCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_total_books">{{ t.stat_total_books || '总图书量' }}</p>
      </div>

      <div class="stat-card bg-danger/10 dark:bg-danger/20 border-l-4 border-danger">
        <div class="text-2xl font-bold" :class="totalFine > 0 ? 'text-danger' : 'text-gray-400'">
          ¥{{ totalFine.toFixed(2) }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_overdue_fine">{{ t.stat_overdue_fine || '待支付罚款' }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h3 class="text-xl font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white"
          data-translate-key="dashboard_quick_links">{{ t.dashboard_quick_links || '快速操作' }}</h3>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <router-link to="/user/books" class="quick-link-card">
          <i class="fa fa-book text-3xl mb-2 text-primary"></i>
          <span data-translate-key="sidebar_book_list">{{ t.sidebar_book_list }}</span>
        </router-link>
        <router-link to="/user/borrowings" class="quick-link-card">
          <i class="fa fa-exchange text-3xl mb-2 text-accent"></i>
          <span data-translate-key="sidebar_my_borrowings">{{ t.sidebar_my_borrowings }}</span>
        </router-link>
        <router-link to="/user/collections" class="quick-link-card">
          <i class="fa fa-bookmark text-3xl mb-2 text-tertiary"></i>
          <span data-translate-key="sidebar_my_collections">{{ t.sidebar_my_collections }}</span>
        </router-link>
        <router-link to="/user/info" class="quick-link-card">
          <i class="fa fa-user-circle-o text-3xl mb-2 text-secondary"></i>
          <span data-translate-key="sidebar_personal_info">{{ t.sidebar_personal_info }}</span>
        </router-link>

        <button @click="handleFeedback" class="quick-link-card bg-neutral dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
          <i class="fa fa-commenting-o text-3xl mb-2 text-gray-500"></i>
          <span data-translate-key="feedback_button">{{ t.feedback_button || '提交反馈' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const userStore = useUserStore();
const dataStore = useDataStore();
const settingsStore = useSettingsStore();

const t = computed(() => settingsStore.currentTranslations);

// 统计数据
const totalBooksCount = computed(() => dataStore.books.length);
const currentBorrowingsCount = computed(() => userStore.borrowings.length);
const totalCollectionsCount = computed(() => userStore.collections.length);

// 实时计算逾期罚款 (重用 MyBorrowingsView.vue 的逻辑)
const FINE_RATE = 0.5;
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const calculateSingleFine = (borrowing) => {
  const today = new Date();
  const dueDate = new Date(borrowing.dueDate);
  if (today > dueDate) {
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / MILLISECONDS_IN_DAY);
    return Math.max(0, diffDays) * FINE_RATE;
  }
  return 0;
};

const totalFine = computed(() => {
  let total = 0;
  userStore.borrowings.forEach(item => {
    total += calculateSingleFine(item);
  });
  return total;
});

/**
 * 提交反馈逻辑 (原 user-page.html 的 #feedback-btn 逻辑)
 * 使用原生 prompt() 模拟原生的交互体验。
 */
const handleFeedback = () => {
  const promptText = t.value.alert_feedback_prompt_placeholder || '请输入您的反馈意见：';
  // 使用 window.prompt 模拟原生的反馈收集
  const feedbackTextValue = prompt(promptText, '');

  if (feedbackTextValue && feedbackTextValue.trim() !== '') {
    // 1. 调用 Pinia Action 来保存反馈
    // 需要在 dataStore 中添加 saveFeedback action
    dataStore.saveFeedback(userStore.currentUser, feedbackTextValue.trim());

    // 2. 提示成功
    alert(t.value.alert_feedback_success || '反馈成功!');
  } else if (feedbackTextValue !== null) {
    // 3. 用户点击了确认但内容为空
    alert(t.value.alert_feedback_empty || '未输入内容。');
  }
  // 如果 feedbackTextValue 为 null，则用户点击了取消，无需提示
};


// ‼️ 重要：需要更新 Pinia Store ‼️
/* // src/stores/dataStore.js (补充 action)
saveFeedback(username, text) {
    const newFeedback = {
        username: username,
        date: new Date().toLocaleDateString('zh-CN'),
        text: text
    };

    // 从 localStorage 加载所有反馈
    let allFeedback = JSON.parse(localStorage.getItem('userFeedback')) || [];
    allFeedback.push(newFeedback);

    // 保存回 localStorage
    localStorage.setItem('userFeedback', JSON.stringify(allFeedback));

    // (可选) 可以在 dataStore.state 中添加一个 feedback 数组来管理，以便管理员视图使用
    // this.feedback.push(newFeedback);
}
*/
</script>

<style scoped>
/* 统计卡片样式 */
.stat-card {
  @apply bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 transition-transform duration-300 hover:scale-[1.03] flex flex-col justify-between h-24;
}

/* 快速链接卡片样式 */
.quick-link-card {
  @apply flex flex-col items-center justify-center p-4 text-center rounded-xl shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200
  hover:bg-primary/10 dark:hover:bg-gray-700 hover:shadow-lg;
}

/* 按钮颜色复用自前一个文件 */
.btn-primary { @apply bg-primary hover:bg-accent text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md; }
</style>
