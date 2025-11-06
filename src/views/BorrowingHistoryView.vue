<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="borrowing_history_title">{{ t.borrowing_history_title }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        <span data-translate-key="history_greeting_text">{{ t.history_greeting_text || '以下是您过去的借阅记录。' }}</span>
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <div v-if="history.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-history text-4xl mb-3"></i>
        <p data-translate-key="alert_no_history">{{ t.alert_no_history || '您目前没有借阅历史记录。' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="table-header" data-translate-key="table_title">{{ t.table_title }}</th>
            <th scope="col" class="table-header" data-translate-key="table_borrow_date">{{ t.table_borrow_date }}</th>
            <th scope="col" class="table-header" data-translate-key="table_due_date">{{ t.table_due_date }}</th>
            <th scope="col" class="table-header" data-translate-key="table_return_date">{{ t.table_return_date || '归还日期' }}</th>
            <th scope="col" class="table-header" data-translate-key="table_fine_paid">{{ t.table_fine_paid || '支付罚款' }}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in history" :key="item.id"
              :class="item.finePaid > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-white dark:bg-gray-800'">
            <td class="table-data font-medium text-gray-900 dark:text-white">{{ getBookTitle(item.bookId) }}</td>
            <td class="table-data">{{ item.borrowDate }}</td>
            <td class="table-data">{{ item.dueDate }}</td>
            <td class="table-data">{{ item.returnDate }}</td>
            <td class="table-data" :class="item.finePaid > 0 ? 'text-danger dark:text-red-400 font-bold' : 'text-accent'">
              ¥{{ (item.finePaid || 0).toFixed(2) }}
            </td>
          </tr>
          </tbody>
        </table>
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
const currentLang = computed(() => settingsStore.currentLang);

// 假设 userStore.history 存储了用户的已归档借阅历史
const history = computed(() => userStore.history.slice().reverse()); // 按时间倒序显示

/**
 * 获取书名 (用于列表展示)
 */
const getBookTitle = (bookId) => {
  const book = dataStore.books.find(b => b.id === bookId);
  return book ? book.title[currentLang.value] : t.value.alert_book_not_found || '图书不存在';
};
</script>

<style scoped>
/* 样式复用自 MyBorrowingsView.vue */
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300; }
.table-data { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }
</style>
