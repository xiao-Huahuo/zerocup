<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <span data-translate-key="admin_welcome_hello">{{ t.admin_welcome_hello || '管理员您好' }}</span>,
        <span class="text-accent">{{ userStore.userInfo.name }}</span>！
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        <span data-translate-key="admin_dashboard_info">{{ t.admin_dashboard_info || '这是您的管理控制台。' }}</span>
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="stat-card bg-primary/10 dark:bg-primary/20 border-l-4 border-primary">
        <i class="fa fa-book text-3xl text-primary mb-2"></i>
        <div class="text-2xl font-bold text-primary dark:text-white">{{ totalBooksCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_total_books">{{ t.stat_total_books || '总图书量' }}</p>
      </div>

      <div class="stat-card bg-accent/10 dark:bg-accent/20 border-l-4 border-accent">
        <i class="fa fa-exchange text-3xl text-accent mb-2"></i>
        <div class="text-2xl font-bold text-accent dark:text-white">{{ borrowedBooksCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_borrowed_out">{{ t.stat_borrowed_out || '已借出' }}</p>
      </div>

      <div class="stat-card bg-danger/10 dark:bg-danger/20 border-l-4 border-danger">
        <i class="fa fa-commenting-o text-3xl text-danger mb-2"></i>
        <div class="text-2xl font-bold text-danger dark:text-white">{{ pendingFeedbackCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_pending_feedback">{{ t.stat_pending_feedback || '待处理反馈' }}</p>
      </div>

      <div class="stat-card bg-yellow-500/10 dark:bg-yellow-500/20 border-l-4 border-yellow-500">
        <i class="fa fa-clock-o text-3xl text-yellow-600 mb-2"></i>
        <div class="text-2xl font-bold text-yellow-600 dark:text-white">{{ overdueBorrowingsCount }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400"
           data-translate-key="stat_overdue_borrowings">{{ t.stat_overdue_borrowings || '逾期借阅' }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h3 class="text-xl font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white"
          data-translate-key="admin_quick_management">{{ t.admin_quick_management || '快速管理' }}</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link to="/admin/book-management" class="admin-link-card">
          <i class="fa fa-book text-4xl mb-2 text-primary"></i>
          <span class="font-semibold" data-translate-key="admin_book_management_title">{{ t.admin_book_management_title || '图书管理' }}</span>
          <p class="text-sm text-gray-500 dark:text-gray-400">增、删、改图书信息</p>
        </router-link>

        <router-link to="/admin/borrowing-status" class="admin-link-card">
          <i class="fa fa-bar-chart text-4xl mb-2 text-accent"></i>
          <span class="font-semibold" data-translate-key="admin_borrowing_status_title">{{ t.admin_borrowing_status_title || '借阅状态概览' }}</span>
          <p class="text-sm text-gray-500 dark:text-gray-400">查看所有用户的借阅和逾期情况</p>
        </router-link>

        <router-link to="/admin/feedback-management" class="admin-link-card"
                     :class="{ 'border-danger/50 ring-2 ring-danger/50': pendingFeedbackCount > 0 }">
          <i class="fa fa-commenting-o text-4xl mb-2" :class="pendingFeedbackCount > 0 ? 'text-danger' : 'text-tertiary'"></i>
          <span class="font-semibold" data-translate-key="admin_feedback_management_title">{{ t.admin_feedback_management_title || '用户反馈管理' }}</span>
          <p v-if="pendingFeedbackCount > 0" class="text-sm text-danger font-bold">
            {{ pendingFeedbackCount }} 条待处理！
          </p>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">处理用户反馈和建议</p>
        </router-link>
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

// --- 统计数据计算 ---

// 1. 总图书数
const totalBooksCount = computed(() => dataStore.books.length);

// 2. 已借出图书
const borrowedBooksCount = computed(() => dataStore.books.filter(b => b.isBorrowed).length);

// 3. 待处理反馈
const pendingFeedbackCount = computed(() => dataStore.feedback.length);

// 4. 逾期借阅数
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const overdueBorrowingsCount = computed(() => {
  // 假设 dataStore.allCurrentBorrowings getter 已经实现 (如目标十八所要求)
  return dataStore.allCurrentBorrowings.filter(borrowing => {
    const today = new Date();
    const dueDate = new Date(borrowing.dueDate);
    // 仅在今天严格大于截止日期时才算逾期
    return today.getTime() > dueDate.getTime() + MILLISECONDS_IN_DAY;
  }).length;
});
</script>

<style scoped>
/* 统计卡片样式 (复用自 UserDashboardView) */
.stat-card {
  @apply bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 transition-transform duration-300 hover:scale-[1.03] flex flex-col justify-between h-32;
}

/* 管理链接卡片样式 */
.admin-link-card {
  @apply flex flex-col items-center justify-center p-6 text-center rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200
  hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-xl border-b-4 border-transparent hover:border-primary/50;
}
</style>
