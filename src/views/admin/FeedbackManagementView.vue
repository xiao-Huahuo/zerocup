<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="admin_feedback_management_title">{{ t.admin_feedback_management_title || '用户反馈管理' }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        <span data-translate-key="admin_feedback_info">{{ t.admin_feedback_info || '查看和处理来自用户的宝贵反馈。' }}</span>
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <div v-if="dataStore.feedback.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-commenting-o text-4xl mb-3"></i>
        <p>{{ t.alert_no_feedback || '暂无用户反馈。' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="table-header" data-translate-key="table_date">{{ t.table_date || '日期' }}</th>
            <th class="table-header" data-translate-key="table_username">{{ t.table_username || '用户名' }}</th>
            <th class="table-header" data-translate-key="table_feedback_content">{{ t.table_feedback_content || '反馈内容' }}</th>
            <th class="table-header" data-translate-key="table_action">{{ t.table_action }}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in reversedFeedback" :key="index" class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="table-data">{{ item.date }}</td>
            <td class="table-data font-medium text-gray-900 dark:text-white">{{ item.username }}</td>
            <td class="table-data whitespace-normal max-w-lg">{{ item.text }}</td>
            <td class="table-data">
              <button @click="handleDeleteFeedback(index)" class="btn-small btn-danger">
                <i class="fa fa-trash mr-1"></i>
                <span data-translate-key="action_mark_handled">{{ t.action_mark_handled || '删除/处理' }}</span>
              </button>
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

// 反馈列表倒序显示（最新在前）
const reversedFeedback = computed(() => dataStore.feedback.slice().reverse());

/**
 * 删除反馈 (模拟标记已处理)
 */
const handleDeleteFeedback = (reversedIndex) => {
  // 逆转后的索引需要转换回原始 dataStore.feedback 数组的索引
  const originalIndex = dataStore.feedback.length - 1 - reversedIndex;

  const confirmMsg = t.value.alert_delete_feedback_confirm || '确定删除此条反馈记录（标记为已处理）吗？';

  if (confirm(confirmMsg)) {
    // 调用 Pinia Action 删除反馈
    dataStore.deleteFeedback(originalIndex);
    alert(t.value.alert_delete_feedback_success || '反馈已删除（标记为已处理）。');
  }
};

// ‼️ 重要：需要更新 Pinia Store ‼️
/* // src/stores/dataStore.js (补充 action)
deleteFeedback(index) {
    if (index >= 0 && index < this.feedback.length) {
        this.feedback.splice(index, 1);
        // 持久化到 localStorage
        localStorage.setItem('userFeedback', JSON.stringify(this.feedback));
        return true;
    }
    return false;
}
*/
</script>

<style scoped>
/* 样式复用和定义 */
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300; }
.table-data { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }

.btn-danger { @apply bg-danger hover:bg-danger-hover text-white font-medium py-1 px-3 text-xs rounded-md transition-all duration-200 shadow-sm; }
.btn-small { @apply py-1 px-3 text-xs rounded-md; }
</style>
