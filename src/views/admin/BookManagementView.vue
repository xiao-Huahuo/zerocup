<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="admin_book_management_title">{{ t.admin_book_management_title || '图书管理' }}</h2>
      <button
        @click="openModal('add')"
        class="btn-primary"
      >
        <i class="fa fa-plus mr-2"></i>
        <span data-translate-key="action_add_book">{{ t.action_add_book || '新增图书' }}</span>
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <div v-if="dataStore.books.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-book text-4xl mb-3"></i>
        <p>{{ t.alert_no_books_found || '暂无图书数据。' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="table-header">ID</th>
            <th class="table-header" data-translate-key="table_title">{{ t.table_title }}</th>
            <th class="table-header" data-translate-key="table_author">{{ t.table_author || '作者' }}</th>
            <th class="table-header" data-translate-key="table_isbn">ISBN</th>
            <th class="table-header" data-translate-key="table_status">{{ t.table_status || '状态' }}</th>
            <th class="table-header" data-translate-key="table_action">{{ t.table_action }}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="book in dataStore.books" :key="book.id" class="bg-white dark:bg-gray-800">
            <td class="table-data">{{ book.id }}</td>
            <td class="table-data font-medium text-gray-900 dark:text-white">{{ book.title[currentLang] }}</td>
            <td class="table-data">{{ book.author }}</td>
            <td class="table-data">{{ book.isbn }}</td>
            <td class="table-data">
                <span :class="book.isBorrowed ? 'text-danger' : 'text-accent'">
                  {{ book.isBorrowed ? (t.status_borrowed || '已借阅') : (t.status_available || '可借阅') }}
                </span>
            </td>
            <td class="table-data space-x-2">
              <button @click="openModal('edit', book)" class="btn-small btn-secondary">
                <i class="fa fa-pencil"></i>
              </button>
              <button @click="handleDeleteBook(book.id)" class="btn-small btn-danger">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        @click.self="isModalOpen = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg">
          <div class="flex justify-between items-center border-b pb-3 mb-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ modalTitle }}</h3>
            <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="fa fa-times text-xl"></i>
            </button>
          </div>

          <form @submit.prevent="handleSaveBook" class="space-y-4">
            <div>
              <label for="title-zh" class="label-style">{{ t.table_title }} (中文)</label>
              <input type="text" id="title-zh" v-model="form.title.zhCN" required class="input-style">
            </div>

            <div>
              <label for="author" class="label-style">{{ t.table_author || '作者' }}</label>
              <input type="text" id="author" v-model="form.author" required class="input-style">
            </div>

            <div>
              <label for="isbn" class="label-style">ISBN</label>
              <input type="text" id="isbn" v-model="form.isbn" required class="input-style">
            </div>

            <div>
              <label for="category-zh" class="label-style">{{ t.table_category || '分类' }} (中文)</label>
              <input type="text" id="category-zh" v-model="form.category.zhCN" required class="input-style">
            </div>

            <button type="submit" class="w-full btn-primary mt-6">{{ modalActionText }}</button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const dataStore = useDataStore();
const settingsStore = useSettingsStore();

const t = computed(() => settingsStore.currentTranslations);
const currentLang = computed(() => settingsStore.currentLang);

// 模态框状态
const isModalOpen = ref(false);
const modalMode = ref('add'); // 'add' or 'edit'

// 表单数据 (初始化默认结构)
const defaultForm = {
  id: null,
  title: { 'zh-CN': '', 'en': '', 'ja': '' },
  author: '',
  isbn: '',
  description: { 'zh-CN': '', 'en': '', 'ja': '' },
  image: 'https://picsum.photos/400/300', // 默认图片
  category: { 'zh-CN': '', 'en': '', 'ja': '' },
  isBorrowed: false
};
const form = ref({...defaultForm});

// 模态框标题和按钮文本
const modalTitle = computed(() => modalMode.value === 'add'
  ? (t.value.admin_add_book || '新增图书')
  : (t.value.admin_edit_book || '编辑图书'));
const modalActionText = computed(() => modalMode.value === 'add'
  ? (t.value.action_add_book || '新增')
  : (t.value.action_save_changes || '保存更改'));


/**
 * 打开模态框并初始化数据
 */
const openModal = (mode, book = null) => {
  modalMode.value = mode;
  if (mode === 'edit' && book) {
    // 深拷贝，避免直接修改 Store
    form.value = JSON.parse(JSON.stringify(book));
    // 简化：使用中文填充英文/日文占位符 (假设其他语言的标题与中文一致，简化操作)
    if (!form.value.title.en) form.value.title.en = form.value.title['zh-CN'];
    if (!form.value.title.ja) form.value.title.ja = form.value.title['zh-CN'];
    if (!form.value.category.en) form.value.category.en = form.value.category['zh-CN'];
    if (!form.value.category.ja) form.value.category.ja = form.value.category['zh-CN'];
  } else {
    form.value = {...defaultForm};
    // 自动设置ID (原 admin.html 的 getNewBookId 逻辑)
    form.value.id = dataStore.books.reduce((maxId, book) => Math.max(maxId, book.id), 0) + 1;
  }
  isModalOpen.value = true;
};

/**
 * 保存图书 (新增或编辑)
 */
const handleSaveBook = () => {
  // 确保所有多语言字段都被填充（至少用中文内容）
  form.value.title.en = form.value.title.en || form.value.title['zh-CN'];
  form.value.title.ja = form.value.title.ja || form.value.title['zh-CN'];
  form.value.category.en = form.value.category.en || form.value.category['zh-CN'];
  form.value.category.ja = form.value.category.ja || form.value.category['zh-CN'];

  if (modalMode.value === 'add') {
    dataStore.addBook(form.value);
    alert(t.value.alert_add_book_success || '图书新增成功！');
  } else {
    dataStore.updateBook(form.value);
    alert(t.value.alert_edit_book_success || '图书更新成功！');
  }

  isModalOpen.value = false;
};

/**
 * 删除图书 (原 admin.html 的 deleteBook 函数)
 */
const handleDeleteBook = (bookId) => {
  const bookTitle = dataStore.books.find(b => b.id === bookId)?.title[currentLang.value] || '该图书';
  const confirmMsg = (t.value.alert_delete_book_confirm || '确定要删除《{title}》吗？')
    .replace('{title}', bookTitle);

  if (confirm(confirmMsg)) {
    dataStore.deleteBook(bookId);
    alert(t.value.alert_delete_book_success || '图书删除成功！');
  }
};
</script>

<style scoped>
/* 样式复用和定义 */
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300; }
.table-data { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }
.label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.input-style { @apply w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white; }

.btn-primary { @apply bg-primary hover:bg-accent text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md; }
.btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300; }
.btn-danger { @apply bg-danger hover:bg-danger-hover text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md; }
.btn-small { @apply py-1 px-3 text-xs rounded-md; }
</style>
