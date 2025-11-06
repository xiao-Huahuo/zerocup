// src/stores/dataStore.js

import { defineStore } from 'pinia';
// 导入静态图书数据
// 假设您已将 book_data.js 的内容复制到 /src/data/bookData.js 并导出了 books 数组
import { books as staticBooks } from '@/data/bookData.js';

/**
 * 辅助函数：从 localStorage 加载用户列表，或使用默认的管理员数据
 */
function loadUsersFromLocalStorage() {
  const users = JSON.parse(localStorage.getItem('users'));

  // 原始项目中的管理员硬编码信息 (Murmur:20060328)
  const defaultAdmin = {
    username: 'Murmur',
    password: '20060328',
    name: '管理员',
    role: 'admin'
  };

  // 如果 localStorage 中没有用户数据，则初始化为只包含管理员
  if (!users) {
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }

  // 确保管理员一直存在（除非被明确删除，这里简化处理）
  if (!users.find(u => u.username === 'Murmur')) {
    users.unshift(defaultAdmin);
  }

  return users;
}

export const useDataStore = defineStore('data', {
  state: () => ({
    // 1. 图书数据: 每次启动都从 localStorage 加载，如果首次运行则使用静态数据
    books: JSON.parse(localStorage.getItem('books')) || staticBooks,

    // 2. 用户数据: 从 localStorage 加载用户列表
    users: loadUsersFromLocalStorage(),

    // 3. 用户反馈: 从 localStorage 加载
    userFeedback: JSON.parse(localStorage.getItem('userFeedback')) || [],

    // 4. 当前借阅和收藏数据 (注意：这些数据依赖于当前登录用户，我们将在 userStore 中处理)
  }),

  actions: {
    /** * 将 state 中的 books 同步到 localStorage
     */
    persistBooks() {
      localStorage.setItem('books', JSON.stringify(this.books));
    },

    /** * 将 state 中的 users 同步到 localStorage (用于注册/修改密码)
     */
    persistUsers() {
      localStorage.setItem('users', JSON.stringify(this.users));
    },

    /**
     * 【模拟注册逻辑】
     * @param {Object} newUser - {username, password, name, role}
     * @returns {boolean} - true 成功 / false 用户名已存在
     */
    registerUser(newUser) {
      const userExists = this.users.some(user => user.username === newUser.username);
      if (userExists) {
        return false;
      }

      this.users.push(newUser);
      this.persistUsers(); // 持久化新用户

      // 模拟原项目为新用户初始化空的借阅和收藏列表
      localStorage.setItem(`borrowings_${newUser.username}`, JSON.stringify([]));
      localStorage.setItem(`collections_${newUser.username}`, JSON.stringify([]));
      localStorage.setItem(`borrowing_history_${newUser.username}`, JSON.stringify([]));

      return true;
    },

    // ... 更多关于图书、借阅、反馈管理的 actions 待补充 ...

  }
});

// 提示：为了项目首次启动能运行，请确保您在 /src/data/ 下创建了 bookData.js，
// 并将原 book_data.js 的内容（const books = [...]）替换为 export const books = [...];
