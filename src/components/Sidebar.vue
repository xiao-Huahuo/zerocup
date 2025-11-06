<template>
  <aside
    id="sidebar"
    class="fixed z-30 inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl
           transform transition-transform duration-300 ease-in-out lg:translate-x-0"
    :class="{ 'translate-x-0': isSidebarOpen, '-translate-x-full': !isSidebarOpen }"
    @click.self="closeSidebar"
  >
    <div class="p-4 flex flex-col h-full">
      <div class="flex items-center justify-between lg:justify-start pb-4 border-b dark:border-gray-700">
        <h2 class="text-2xl font-bold text-accent" data-translate-key="system_title">{{ t.system_title }}</h2>
        <button class="lg:hidden text-gray-700 dark:text-gray-300" @click="closeSidebar">
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>

      <div class="mt-4 p-3 bg-neutral dark:bg-gray-700 rounded-lg shadow-inner">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400"
           data-translate-key="login_identity">{{ userStore.isAdmin ? t.identity_admin : t.identity_user }}</p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white" id="user-name-display">{{ userStore.userInfo.name }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">@{{ userStore.currentUser }}</p>
      </div>

      <nav class="flex-grow mt-6 space-y-2 overflow-y-auto">
        <template v-for="item in navItems" :key="item.name">
          <router-link
            v-if="!item.adminOnly || userStore.isAdmin"
            :to="item.path"
            class="sidebar-item"
            :class="{ 'active': $route.path.startsWith(item.path) && item.path !== '/user', 'active': $route.path === '/user' && item.path === '/user' }"
            @click="isSidebarOpen = false"
          >
            <i :class="['fa', item.icon, 'text-lg w-5']"></i>
            <span data-translate-key>{{ t[item.translateKey] }}</span>
          </router-link>
        </template>
      </nav>

      <div class="pt-4 border-t dark:border-gray-700">
        <router-link
          to="/user/settings"
          class="sidebar-item text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'active': $route.path.startsWith('/user/settings') }"
          @click="isSidebarOpen = false"
        >
          <i class="fa fa-cog text-lg w-5"></i>
          <span data-translate-key="system_settings_title">{{ t.system_settings_title }}</span>
        </router-link>

        <button
          id="logout-btn"
          @click="handleLogout"
          class="sidebar-item w-full text-left text-danger hover:bg-red-50 dark:hover:bg-red-900/50 mt-2"
        >
          <i class="fa fa-sign-out text-lg w-5"></i>
          <span data-translate-key="logout_button">{{ t.logout_button || '登出' }}</span>
        </button>
      </div>
    </div>
  </aside>

  <div
    v-show="isSidebarOpen"
    class="fixed inset-0 bg-black opacity-50 z-20 lg:hidden transition-opacity duration-300"
    @click="closeSidebar"
  ></div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const router = useRouter();

// 侧边栏状态 (用于移动端，取代原生的 translate-x-full 切换)
const isSidebarOpen = ref(false);

const t = computed(() => settingsStore.currentTranslations);

// 导航列表数据 (根据原 HTML 文件结构定义)
const navItems = computed(() => [
  { path: userStore.isAdmin ? '/admin' : '/user', icon: 'fa-tachometer', translateKey: 'menu_dashboard', name: 'Dashboard' }, // user-page.html 或 admin.html
  { path: '/user/books', icon: 'fa-book', translateKey: 'menu_books', name: 'Book List' }, // page.html
  { path: '/user/borrowings', icon: 'fa-exchange', translateKey: 'menu_my_borrowings', name: 'My Borrowings' }, // my_borrowings.html
  { path: '/user/collections', icon: 'fa-bookmark', translateKey: 'menu_my_collections', name: 'My Collections' }, // my_collections.html
  { path: '/user/history', icon: 'fa-history', translateKey: 'menu_borrowing_history', name: 'Borrowing History' }, // borrowing_history.html
  { path: '/user/info', icon: 'fa-user', translateKey: 'menu_personal_info', name: 'Personal Info' }, // personal_info.html
  // 管理员独有页面 (如果需要分离管理员和用户侧边栏，这里需调整)
  { path: '/admin/management', icon: 'fa-database', translateKey: 'menu_book_management', name: 'Book Management', adminOnly: true },
  // 假设管理员有单独的用户反馈管理 (从 admin.html 提取)
  { path: '/admin/feedback', icon: 'fa-envelope-open-o', translateKey: 'menu_user_feedback', name: 'User Feedback', adminOnly: true },
]);


/**
 * 登出处理函数
 * 取代原 HTML 文件中的 sessionStorage.removeItem('currentUser') 和 location.href='login.html'
 */
const handleLogout = () => {
  if (confirm(t.value.alert_logout_confirm || '确定要登出吗？')) {
    userStore.logout();
    alert(t.value.alert_logout_success || '您已成功登出！');
    router.push('/login');
  }
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// 暴露 toggle 方法给父组件 (通用布局)
defineExpose({
  toggleSidebar: () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  },
  isSidebarOpen
});
</script>

<style>
/* 将原 HTML 文件中的 .sidebar-item 样式移到全局或此处 */
.sidebar-item {
  /* 采用 @apply 风格手动实现，确保与您的 Tailwind 配置匹配 */
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
  padding: 0.75rem 1rem; /* px-4 py-3 */
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 0.2s;
  color: #4B5563; /* text-gray-700 */
  text-decoration: none;
}
.dark .sidebar-item {
  color: #D1D5DB; /* dark:text-gray-300 */
}
.sidebar-item:hover {
  background-color: #F3F4F6; /* hover:bg-gray-100 */
}
.dark .sidebar-item:hover {
  background-color: #374151; /* dark:hover:bg-gray-700 */
}
.sidebar-item.active {
  background-color: rgba(129, 199, 132, 0.2); /* bg-primary/20 */
  color: #4CAF50; /* text-accent */
  font-weight: 500;
}
.dark .sidebar-item.active {
  background-color: rgba(129, 199, 132, 0.3); /* dark:bg-primary/30 */
  color: white; /* dark:text-white */
}
</style>
