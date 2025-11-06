<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="my_collections_title">{{ t.my_collections_title }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        <span data-translate-key="collections_greeting_text">{{ t.collections_greeting_text || '以下是您收藏的所有图书。' }}</span>
      </p>
    </div>

    <div id="collections-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <template v-if="userStore.collections.length > 0">
        <div
          v-for="book in userStore.collections"
          :key="book.id"
          class="book-card group"
        >
          <div class="relative overflow-hidden rounded-t-lg h-48">
            <img :src="book.image" :alt="book.title[settingsStore.currentLang]" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <span v-if="book.isBorrowed" class="status-tag bg-danger" data-translate-key="status_borrowed">{{ t.status_borrowed }}</span>
            <span v-else class="status-tag bg-accent" data-translate-key="status_available">{{ t.status_available }}</span>
          </div>

          <div class="p-4 space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate" :title="book.title[settingsStore.currentLang]">
              {{ book.title[settingsStore.currentLang] }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ book.author }}</p>
            <p class="text-xs text-primary dark:text-secondary font-medium">{{ book.category[settingsStore.currentLang] }}</p>
          </div>

          <div class="p-4 border-t dark:border-gray-700">
            <button
              @click="handleRemoveCollection(book)"
              class="w-full btn-danger"
              data-translate-key="action_remove_collection">{{ t.action_remove_collection || '取消收藏' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-bookmark-o text-4xl mb-3"></i>
        <p data-translate-key="alert_no_collections">{{ t.alert_no_collections || '您还没有收藏任何图书。' }}</p>
        <router-link to="/user/books" class="text-accent hover:text-primary mt-2 block font-medium"
                     data-translate-key="link_go_to_books">{{ t.link_go_to_books || '前往图书列表' }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const t = computed(() => settingsStore.currentTranslations);
const currentLang = computed(() => settingsStore.currentLang);

/**
 * 取消收藏图书逻辑 (原 my_collections.html 的 removeCollection 函数)
 */
const handleRemoveCollection = (book) => {
  // 1. 确认操作
  const confirmMsg = (t.value.alert_collection_remove_confirm || '确定要将《{title}》从收藏中移除吗？')
    .replace('{title}', book.title[currentLang.value]);

  if (confirm(confirmMsg)) {
    // 2. 调用 Pinia action 执行取消收藏
    // 此 action 已在 BookListView 逻辑中假设存在
    userStore.uncollectBook(book.id); // 假设 userStore 包含 uncollectBook action

    // 3. 提示成功 (使用翻译占位符替换)
    const successMsg = (t.value.alert_collection_remove || '《{title}》已从收藏中移除。')
      .replace('{title}', book.title[currentLang.value]);
    alert(successMsg);

    // 4. 重新加载用户数据 (虽然 Pinia 响应式会自动更新，但为了完整性，保持习惯)
    userStore.loadUserData();
  }
};

// ‼️ 重要：需要更新 Pinia Store ‼️
/* // src/stores/userStore.js (确保包含以下 Action/Getter)

// 假设 userStore 的 loadUserData 方法会从 localStorage 中加载 collections
// 并在 dataStore.js 中实现 uncollectBook action，或者直接在 userStore 中操作收藏列表。
// 为了简化，我们假设直接在 userStore 中操作：

// src/stores/userStore.js (补充 action)
uncollectBook(bookId) {
    const index = this.collections.findIndex(b => b.id === bookId);
    if (index > -1) {
        this.collections.splice(index, 1);
        // 持久化到 localStorage
        localStorage.setItem(`collections_${this.currentUser}`, JSON.stringify(this.collections));
        return true;
    }
    return false;
}
*/
</script>

<style scoped>
/* 样式复用自 BookListView.vue */
.book-card { @apply bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]; }
.status-tag { @apply absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md; }
.btn-danger { @apply bg-danger hover:bg-danger-hover text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md; }
</style>
