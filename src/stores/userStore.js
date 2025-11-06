// src/stores/userStore.js

import { defineStore } from 'pinia';
import { useDataStore } from './dataStore.js'; // 引入数据中心

// 从 sessionStorage 恢复当前用户状态
const initialUser = sessionStorage.getItem('currentUser') || null;

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: initialUser, // 当前登录的用户名 (null 或 'username')

    // 借阅、收藏数据需要动态加载，因为它们是按用户存储的
    borrowings: [],
    collections: [],
    borrowingHistory: [],
  }),

  getters: {
    /** 检查用户是否已登录 */
    isLoggedIn: (state) => !!state.currentUser,

    /** 获取当前用户的角色和名称 (从 dataStore 中获取) */
    userInfo: (state) => {
      const dataStore = useDataStore();
      return dataStore.users.find(u => u.username === state.currentUser) || { role: null, name: '访客' };
    },

    /** 检查用户是否是管理员 */
    isAdmin: (state) => {
      return state.currentUser === 'Murmur' && state.userInfo.role === 'admin';
    }
  },

  actions: {
    /** * 1. 动态加载当前用户的借阅、收藏和历史数据
     */
    loadUserData() {
      if (this.currentUser) {
        // 模拟原项目从 localStorage 加载用户专属数据
        this.borrowings = JSON.parse(localStorage.getItem(`borrowings_${this.currentUser}`)) || [];
        this.collections = JSON.parse(localStorage.getItem(`collections_${this.currentUser}`)) || [];
        this.borrowingHistory = JSON.parse(localStorage.getItem(`borrowing_history_${this.currentUser}`)) || [];
      } else {
        this.borrowings = [];
        this.collections = [];
        this.borrowingHistory = [];
      }
    },

    /**
     * 2. 【登录逻辑】
     * @param {string} username
     * @param {string} password
     */
    login(username, password) {
      const dataStore = useDataStore();
      const user = dataStore.users.find(u => u.username === username && u.password === password);

      if (user) {
        // 模拟原项目保存到 sessionStorage
        sessionStorage.setItem('currentUser', user.username);
        this.currentUser = user.username;
        this.loadUserData(); // 加载用户数据
        return user.role; // 返回用户角色，用于后续跳转判断
      }
      return null;
    },

    /**
     * 3. 【登出逻辑】
     */
    logout() {
      sessionStorage.removeItem('currentUser');
      this.currentUser = null;
      this.loadUserData(); // 清空用户数据
    },

    /**
     * 4. 持久化当前用户的借阅数据
     */
    persistBorrowings() {
      if (this.currentUser) {
        localStorage.setItem(`borrowings_${this.currentUser}`, JSON.stringify(this.borrowings));
      }
    },

    // ... 更多关于借阅、收藏的操作 actions 待补充 ...
  }
});
