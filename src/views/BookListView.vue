<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 flex flex-wrap gap-4 items-center">

      <div class="flex-1 min-w-[200px]">
        <label for="search-input" class="sr-only">{{ t.search_placeholder }}</label>
        <div class="relative">
          <input
            type="text"
            id="search-input"
            v-model="searchTerm"
            :placeholder="t.search_placeholder"
            class="input-style w-full pl-10"
          >
          <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <div class="min-w-[150px]">
        <select id="category-select" v-model="selectedCategory" class="input-style">
          <option value="">{{ t.filter_all_categories }}</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="min-w-[150px]">
        <select id="sort-select" v-model="sortBy" class="input-style">
          <option value="id">{{ t.sort_by_default }}</option>
          <option value="title">{{ t.sort_by_title }}</option>
          <option value="author">{{ t.sort_by_author }}</option>
        </select>
      </div>
    </div>

    <div id="book-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <template v-if="filteredAndSortedBooks.length > 0">
        <div
          v-for="book in filteredAndSortedBooks"
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

          <div class="flex p-4 border-t dark:border-gray-700 space-x-2">
            <button
              @click="handleBorrow(book)"
              :disabled="book.isBorrowed"
              class="flex-1 btn-small"
              :class="book.isBorrowed ? 'btn-disabled' : 'btn-primary'"
            >
              <i class="fa fa-exchange mr-1"></i>
              {{ book.isBorrowed ? t.status_borrowed : t.action_borrow }}
            </button>

            <button
              @click="handleCollect(book)"
              class="btn-small w-10 p-0"
              :class="isCollected(book.id) ? 'btn-collected' : 'btn-secondary'"
            >
              <i class="fa text-lg" :class="isCollected(book.id) ? 'fa-bookmark' : 'fa-bookmark-o'"></i>
            </button>
          </div>
        </div>
      </template>
      <div v-else class="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-frown-o text-4xl mb-3"></i>
        <p data-translate-key="alert_no_books_found">{{ t.alert_no_books_found }}</p>
      </div>
    </div>

    <AiChatWindow />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { useUserStore } from '@/stores/userStore';
import { useSettingsStore } from '@/stores/settingsStore';
import AiChatWindow from '@/components/AiChatWindow.vue'; // 假设 AI 聊天窗口已抽象

// Hooks
const dataStore = useDataStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

// 筛选/搜索状态 (取代原生JS中的 DOM value)
const searchTerm = ref('');
const selectedCategory = ref('');
const sortBy = ref('id');

const t = computed(() => settingsStore.currentTranslations);
const currentLang = computed(() => settingsStore.currentLang);

// --- 计算属性和 Getter ---

// 1. 获取所有不重复的分类 (用于筛选下拉框)
const uniqueCategories = computed(() => {
  const categories = dataStore.books.map(book => book.category[currentLang.value]).filter(Boolean);
  return [...new Set(categories)].sort();
});

// 2. 筛选和排序逻辑 (取代原 page.html 的 filterBooks 函数)
const filteredAndSortedBooks = computed(() => {
  let list = dataStore.books;
  const lang = currentLang.value;

  // 筛选：搜索关键词 (书名、作者、ISBN)
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    list = list.filter(book =>
      book.title[lang].toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.isbn.includes(term)
    );
  }

  // 筛选：分类
  if (selectedCategory.value) {
    list = list.filter(book => book.category[lang] === selectedCategory.value);
  }

  // 排序
  if (sortBy.value === 'title') {
    list.sort((a, b) => a.title[lang].localeCompare(b.title[lang], lang));
  } else if (sortBy.value === 'author') {
    list.sort((a, b) => a.author.localeCompare(b.author, lang));
  }
  // 默认按 ID (原顺序)

  return list;
});

// 3. 检查图书是否已被当前用户收藏
const isCollected = (bookId) => {
  return userStore.collections.some(book => book.id === bookId);
};


// --- 操作函数 (取代原生JS中的事件监听器) ---

/**
 * 借阅图书逻辑 (原 page.html 的 borrowBook 函数)
 */
const handleBorrow = (book) => {
  // 检查是否已被借阅 (双重检查)
  if (book.isBorrowed) {
    alert(t.value.alert_borrow_fail || '抱歉，本书已被借阅！');
    return;
  }

  // 1. 调用 Pinia action 执行借阅
  dataStore.borrowBook(book.id, userStore.currentUser);

  // 2. 提示成功 (使用翻译占位符替换)
  const successMsg = (t.value.alert_borrow_success || '《{title}》借阅成功！')
    .replace('{title}', book.title[currentLang.value]);
  alert(successMsg);

  // 3. 重新加载用户借阅数据 (确保 Sidebar 和其他视图能立即更新)
  userStore.loadUserData();
};

/**
 * 收藏/取消收藏图书逻辑 (原 page.html 的 collectBook 函数)
 */
const handleCollect = (book) => {
  if (isCollected(book.id)) {
    // 取消收藏
    dataStore.uncollectBook(book.id, userStore.currentUser);
    const successMsg = (t.value.alert_collection_remove || '《{title}》已从收藏中移除。')
      .replace('{title}', book.title[currentLang.value]);
    alert(successMsg);
  } else {
    // 添加收藏
    dataStore.collectBook(book.id, userStore.currentUser);
    const successMsg = (t.value.alert_collection_add || '《{title}》收藏成功！')
      .replace('{title}', book.title[currentLang.value]);
    alert(successMsg);
  }
  // 确保用户收藏列表更新
  userStore.loadUserData();
};
</script>

<style scoped>
/* 样式复用和定义 */
.input-style { @apply block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors; }
.book-card { @apply bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]; }
.status-tag { @apply absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md; }
.btn-small { @apply py-2 px-3 text-sm rounded-lg transition-all duration-200; }
.btn-primary { @apply bg-primary hover:bg-accent text-white; }
.btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300; }
.btn-collected { @apply bg-accent hover:bg-primary text-white; }
.btn-disabled { @apply bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500; }

/* ！！！重要：需要更新 Pinia Store ！！！*/
/* 确保 dataStore.js 包含以下 Actions:
   1. borrowBook(bookId, username)
   2. collectBook(bookId, username)
   3. uncollectBook(bookId, username)
*/
</style>
