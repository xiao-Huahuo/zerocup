<template>
  <div
    id="background-slideshow"
    class="relative min-h-screen bg-cover bg-center transition-all duration-1000"
    :class="[settingsStore.currentTheme === 'dark' ? 'dark-mode-bg' : 'light-mode-bg']"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6
               transform transition-all duration-300 hover:shadow-primary/50"
      >
        <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white"
            data-translate-key="login_header">{{ t.login_header }}</h1>

        <div>
          <label for="login-role" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="login_identity">{{ t.login_identity }}</label>
          <select
            id="login-role"
            v-model="role"
            class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="user" data-translate-key="identity_user">{{ t.identity_user }}</option>
            <option value="admin" data-translate-key="identity_admin">{{ t.identity_admin }}</option>
          </select>
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="login_username">{{ t.login_username }}</label>
          <input
            type="text"
            id="username"
            v-model="username"
            :placeholder="t.login_username_placeholder"
            class="mt-1 block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="login_password">{{ t.login_password }}</label>
          <input
            type="password"
            id="password"
            v-model="password"
            :placeholder="t.login_password_placeholder"
            class="mt-1 block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @keyup.enter="handleLogin"
          >
        </div>

        <button
          id="login-btn"
          @click="handleLogin"
          :disabled="!username || !password"
          class="w-full btn-primary"
          data-translate-key="login_button"
        >
          {{ t.login_button }}
        </button>

        <p class="text-sm text-center text-gray-600 dark:text-gray-400">
          <span data-translate-key="login_no_account">{{ t.login_no_account }}</span>
          <router-link to="/register" class="text-accent hover:underline ml-1 font-medium"
                       data-translate-key="login_register_now">{{ t.login_register_now }}</router-link>
        </p>
      </div>
    </div>
  </div>
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

// 响应式数据 (取代原生JS中的 DOM value 获取)
const username = ref('');
const password = ref('');
const role = ref('user'); // 默认是普通用户

// 翻译计算属性
const t = computed(() => settingsStore.currentTranslations);

/**
 * 登录处理函数，取代原 login.html 中的 click 监听器逻辑
 */
const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert(t.value.alert_fill_all);
    return;
  }

  // 1. 调用 Pinia Store 中的登录逻辑
  const userRole = await userStore.login(username.value, password.value);

  // 2. 根据结果处理页面跳转和提示
  if (userRole === 'admin') {
    if (role.value === 'admin') {
      alert(t.value.alert_admin_login_success);
      router.push('/admin'); // 跳转到管理员页
    } else {
      // 登录成功但身份选择错误 (原逻辑中没有这种情况，这里增加校验)
      alert(t.value.alert_admin_login_fail); // 也可以是其他提示
      userStore.logout(); // 重新登出
    }
  } else if (userRole === '普通用户') {
    if (role.value === 'user') {
      alert(t.value.alert_user_login_success);
      router.push('/user'); // 跳转到用户首页
    } else {
      // 普通用户尝试以管理员身份登录
      alert(t.value.alert_admin_login_fail);
      userStore.logout(); // 重新登出
    }
  } else {
    // 登录失败
    alert(t.value.alert_user_login_fail);
    password.value = ''; // 清空密码
  }
};

</script>

<style scoped>
/* 模拟原 login.html 中的背景切换样式，需要配合项目资源图片 */
.light-mode-bg {
  background-image: url('/images/background1.jpg'); /* 假设图片在 /public/images/ */
}
.dark-mode-bg {
  /* 可以为深色模式设置不同的背景图 */
  background-image: url('/images/background2.jpg');
}

/* 引入原 login.html 的 btn-primary 和 input-focus 样式 */
.input-focus {
  transition: all 0.2s;
}

/* 注意：Tailwind CSS 的 @apply 无法直接在 <style scoped> 中使用，
   建议将原 tailwind.config 中的自定义样式移到 Vue 全局 CSS 或使用 Tailwind 插件 */
.btn-primary {
  /* 临时手动实现原样式 */
  background-color: #81C784;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.btn-primary:hover {
  background-color: #4CAF50;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
