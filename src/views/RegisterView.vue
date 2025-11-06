<template>
  <div
    class="relative min-h-screen bg-cover bg-center transition-all duration-1000"
    :class="[settingsStore.currentTheme === 'dark' ? 'dark-mode-bg' : 'light-mode-bg']"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6
               transform transition-all duration-300"
      >
        <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white"
            data-translate-key="registration_title">{{ t.registration_title }}</h1>

        <div>
          <label for="reg-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="registration_name">{{ t.registration_name }}</label>
          <input
            type="text"
            id="reg-name"
            v-model="name"
            :placeholder="t.registration_name_placeholder"
            class="mt-1 block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>

        <div>
          <label for="reg-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="login_username">{{ t.login_username }}</label>
          <input
            type="text"
            id="reg-username"
            v-model="username"
            :placeholder="t.login_username_placeholder"
            class="mt-1 block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>

        <div>
          <label for="reg-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                 data-translate-key="login_password">{{ t.login_password }}</label>
          <input
            type="password"
            id="reg-password"
            v-model="password"
            :placeholder="t.login_password_placeholder"
            class="mt-1 block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>

        <button
          id="register-btn"
          @click="handleRegister"
          :disabled="!username || !password || !name"
          class="w-full btn-primary"
          data-translate-key="registration_button"
        >
          {{ t.registration_button }}
        </button>

        <p class="text-sm text-center text-gray-600 dark:text-gray-400">
          <span data-translate-key="registration_has_account">{{ t.registration_has_account }}</span>
          <router-link to="/login" class="text-accent hover:underline ml-1 font-medium"
                       data-translate-key="registration_login_now">{{ t.registration_login_now }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const router = useRouter();

// 响应式数据
const username = ref('');
const password = ref('');
const name = ref('');

// 翻译计算属性
const t = computed(() => settingsStore.currentTranslations);

/**
 * 注册处理函数，取代原 registration.html 中的 click 监听器逻辑
 */
const handleRegister = async () => {
  // 1. 必填字段检查 (原 registration.html 逻辑)
  if (!username.value || !password.value || !name.value) {
    alert(t.value.alert_registration_fail_all_fields);
    return;
  }

  const newUser = {
    username: username.value,
    password: password.value,
    name: name.value,
    role: '普通用户' // 默认注册角色
  };

  // 2. 调用 Pinia Store 中的注册逻辑
  const success = dataStore.registerUser(newUser);

  // 3. 处理结果和页面跳转
  if (success) {
    alert(t.value.alert_registration_success);
    // 注册成功后跳转到登录页 (原 registration.html 逻辑)
    router.push('/login');
  } else {
    // 用户名已存在
    alert(t.value.alert_registration_fail_user_exists);
  }
};

</script>

<style scoped>
/* 重用 LoginView 的样式，通常这应该放在全局 CSS 中 */
.light-mode-bg {
  background-image: url('/images/background1.jpg');
}
.dark-mode-bg {
  background-image: url('/images/background2.jpg');
}
.input-focus {
  /* 确保样式被导入或定义 */
}
.btn-primary {
  /* 确保样式被导入或定义 */
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
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
