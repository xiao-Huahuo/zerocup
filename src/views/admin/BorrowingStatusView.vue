<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="admin_borrowing_status_title">{{ t.admin_borrowing_status_title || '所有用户借阅状态' }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        <span data-translate-key="admin_borrowing_status_info">{{ t.admin_borrowing_status_info || '查看所有用户当前的借阅和逾期情况。' }}</span>
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <div v-if="allBorrowings.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-exclamation-triangle text-4xl mb-3"></i>
        <p>{{ t.alert_no_current_borrowings || '当前没有正在借阅的图书。' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="table-header" data-translate-key="table_username">{{ t.table_username || '用户名' }}</th>
            <th class="table-header" data-translate-key="table_title">{{ t.table_title }}</th>
            <th class="table-header" data-translate-key="table_borrow_date">{{ t.table_borrow_date }}</th>
            <th class="table-header" data-translate-key="table_due_date">{{ t.table_due_date }}</th>
            <th class="table-header" data-translate-key="table_status">{{ t.table_status || '状态' }}</th>
            <th class="table-header" data-translate-key="table_fine">{{ t.table_fine || '实时罚款' }}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in allBorrowings" :key="item.id"
              :class="isOverdue(item) ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800'">
            <td class="table-data font-medium text-gray-900 dark:text-white">{{ item.username }}</td>
            <td class="table-data">{{ getBookTitle(item.bookId) }}</td>
            <td class="table-data">{{ item.borrowDate }}</td>
            <td class="table-data font-medium" :class="isOverdue(item) ? 'text-danger dark:text-red-400' : 'text-accent'">
              {{ item.dueDate }}
            </td>
            <td class="table-data">
                 <span :class="isOverdue(item) ? 'text-danger font-bold' : 'text-accent'">
                    {{ isOverdue(item) ? (t.status_overdue || '已逾期') : (t.status_on_time || '未逾期') }}
                 </span>
            </td>
            <td class="table-data" :class="calculateSingleFine(item) > 0 ? 'text-danger dark:text-red-400 font-bold' : 'text-accent'">
              ¥{{ calculateSingleFine(item).toFixed(2) }}
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
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const dataStore = useDataStore();
const settingsStore = useSettingsStore();

const t = computed(() => settingsStore.currentTranslations);
const currentLang = computed(() => settingsStore.currentLang);

// 实时罚款计算常量 (与 MyBorrowingsView.vue 保持一致)
const FINE_RATE = 0.5;
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

// 核心数据：所有用户的当前借阅记录
// ‼️ 重要：需要假设 dataStore 中有一个 getAllCurrentBorrowings getter
const allBorrowings = computed(() => dataStore.allCurrentBorrowings);

/**
 * 检查借阅记录是否逾期
 */
const isOverdue = (borrowing) => {
  const today = new Date();
  const dueDate = new Date(borrowing.dueDate);
  // 仅在今天严格大于截止日期时才算逾期
  return today.getTime() > dueDate.getTime() + MILLISECONDS_IN_DAY;
};

/**
 * 计算单本书的罚款金额
 */
const calculateSingleFine = (borrowing) => {
  if (!isOverdue(borrowing)) {
    return 0;
  }

  const today = new Date();
  const dueDate = new Date(borrowing.dueDate);
  const diffTime = today.getTime() - dueDate.getTime();
  // 向上取整，确保只要超过一天就计费
  const diffDays = Math.ceil(diffTime / MILLISECONDS_IN_DAY);

  // 最小为 0
  return Math.max(0, diffDays) * FINE_RATE;
};

/**
 * 获取书名 (用于列表展示)
 */
const getBookTitle = (bookId) => {
  const book = dataStore.books.find(b => b.id === bookId);
  return book ? book.title[currentLang.value] : t.value.alert_book_not_found || '图书不存在';
};


// ‼️ 重要：需要更新 Pinia Store ‼️
/* // src/stores/dataStore.js (补充 Getter)

// 需要一个函数来聚合所有用户的借阅记录
function loadAllCurrentBorrowings() {
    let all = [];
    // 假设 userStore 拥有一个所有用户列表
    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.forEach(user => {
        const userBorrowings = JSON.parse(localStorage.getItem(`borrowings_${user.username}`)) || [];
        userBorrowings.forEach(borrowing => {
            all.push({
                ...borrowing,
                username: user.username // 标记属于哪个用户
            });
        });
    });
    // 添加管理员的借阅（如果有的话）
    const adminBorrowings = JSON.parse(localStorage.getItem(`borrowings_Murmur`)) || [];
     adminBorrowings.forEach(borrowing => {
            all.push({
                ...borrowing,
                username: 'Murmur'
            });
        });

    return all;
}

// 在 dataStore.js 中定义：
const useDataStore = defineStore('data', {
    state: () => ({
        // ... 其他状态 ...
    }),
    getters: {
        allCurrentBorrowings() {
            return loadAllCurrentBorrowings();
        }
    },
    actions: {
        // ... 其他 actions ...
    }
});
*/
</script>

<style scoped>
/* 样式复用和定义 */
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300; }
.table-data { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }
</style>
