// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
// 导入布局组件
import UserLayout from '@/layouts/UserLayout.vue';
// 认证/非认证页面
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

// 认证后页面 (待创建)
// import UserDashboardView from '@/views/UserDashboardView.vue';
// import AdminDashboardView from '@/views/AdminDashboardView.vue';
// import BookListView from '@/views/BookListView.vue';
// ...

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. 公开路由 (无需登录)
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },

    // 2. 保护路由 (需要登录)
    // 根路径跳转到登录，这是原项目的逻辑，我们用重定向实现
    {
      path: '/',
      redirect: '/login',
    },

    // 3. 用户页面的父级路由 (UserLayout)
    {
      path: '/user',
      component: UserLayout, // 使用通用布局
      meta: { requiresAuth: true, role: 'user', titleKey: 'user_home_title' },
      children: [
        // 默认首页 (对应 user-page.html)
        { path: '', name: 'user-home', component: () => import('@/views/UserDashboardView.vue'), meta: { titleKey: 'user_home_title' } },
        // 图书列表 (对应 page.html)
        { path: 'books', name: 'book-list', component: () => import('@/views/BookListView.vue'), meta: { titleKey: 'book_list_title' } },
        // 我的借阅 (对应 my_borrowings.html)
        { path: 'borrowings', name: 'my-borrowings', component: () => import('@/views/MyBorrowingsView.vue'), meta: { titleKey: 'my_borrowings_title' } },
        // 我的收藏 (对应 my_collections.html)
        { path: 'collections', name: 'my-collections', component: () => import('@/views/MyCollectionsView.vue'), meta: { titleKey: 'my_collections_title' } },
        // 借阅历史 (对应 borrowing_history.html)
        { path: 'history', name: 'borrowing-history', component: () => import('@/views/BorrowingHistoryView.vue'), meta: { titleKey: 'borrowing_history_title' } },
        // 个人信息 (对应 personal_info.html)
        { path: 'info', name: 'personal-info', component: () => import('@/views/PersonalInfoView.vue'), meta: { titleKey: 'personal_info_title' } },
        // 系统设置 (对应 system_settings.html)
        { path: 'settings', name: 'system-settings', component: () => import('@/views/SettingsView.vue'), meta: { titleKey: 'system_settings_title' } },
      ]
    },

    // 4. 管理员页面的父级路由 (AdminLayout 待创建)
    {
      path: '/admin',
      // 假设管理员也使用 UserLayout，但导航栏会根据权限调整
      component: UserLayout,
      meta: { requiresAuth: true, role: 'admin', titleKey: 'admin_title' },
      children: [
        // 默认管理员首页 (对应 admin.html)
        { path: '', name: 'admin-home', component: () => import('@/views/AdminDashboardView.vue'), meta: { titleKey: 'admin_title' } },
        // ... 管理员的其他子路由，如图书管理、反馈管理
      ]
    },

    // 通配符路由 (可选)
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ]
});

// --- 全局认证守卫：取代 global.js 中的 if (isProtectedPage && !currentUser) 逻辑 ---
router.beforeEach(async (to, from) => {
  const userStore = useUserStore();

  // 确保用户的最新数据已加载（例如，从 sessionStorage 恢复）
  if (!userStore.isLoggedIn && userStore.currentUser) {
    userStore.loadUserData();
  }

  const isAuthenticated = userStore.isLoggedIn;
  const requiredAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role;

  // 1. 检查是否需要登录，但用户未登录
  if (requiredAuth && !isAuthenticated) {
    // 模拟原 global.js 的 alert 提示
    const settingsStore = useSettingsStore();
    alert(settingsStore.currentTranslations.alert_login_prompt || '请先登录！');
    // 重定向到登录页
    return { name: 'login' };
  }

  // 2. 检查权限 (如果目标路由是管理员页面，但用户不是管理员)
  if (requiredRole === 'admin' && isAuthenticated && !userStore.isAdmin) {
    // 模拟原项目的权限不足提示
    const settingsStore = useSettingsStore();
    alert(settingsStore.currentTranslations.alert_admin_no_access || '您没有权限访问此页面！');
    // 重定向到用户首页
    return { path: '/user' };
  }

  // 3. 如果用户已登录，不允许访问登录/注册页
  if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // 根据角色重定向：管理员去 /admin，普通用户去 /user
    if (userStore.isAdmin) {
      return { path: '/admin' };
    } else {
      return { path: '/user' };
    }
  }

  // 允许导航
  return true;
});

export default router;
