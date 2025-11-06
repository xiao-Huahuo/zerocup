<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          data-translate-key="personal_info_welcome">{{ t.personal_info_welcome }}</h2>
      <p class="text-gray-600 dark:text-gray-400">
        <span data-translate-key="personal_info_greeting">{{ t.personal_info_greeting }}</span>
        <span class="font-semibold text-accent">{{ userStore.userInfo.name }}</span>！
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-4">
        <h3 class="text-xl font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white"
            data-translate-key="personal_info_title_basic">{{ t.personal_info_title_basic }}</h3>

        <div class="info-item">
          <span class="info-label" data-translate-key="login_username">{{ t.login_username }}</span>
          <span class="info-value">{{ userStore.currentUser }}</span>
        </div>

        <div class="info-item">
          <span class="info-label" data-translate-key="registration_name">{{ t.registration_name }}</span>
          <span class="info-value">{{ userStore.userInfo.name }}</span>
        </div>

        <div class="info-item">
          <span class="info-label" data-translate-key="login_identity">{{ t.login_identity }}</span>
          <span class="info-value">{{ userStore.userInfo.role }}</span>
        </div>

        <button
          @click="handleLogout"
          class="w-full mt-4 btn-danger"
          data-translate-key="logout_button"
        >
          <i class="fa fa-sign-out mr-2"></i> {{ t.logout_button }}
        </button>
      </div>

      <div class="lg:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <h3 class="text-xl font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white"
            data-translate-key="personal_info_title_security">{{ t.personal_info_title_security }}</h3>

        <form @submit.prevent="handleChangePassword" class="space-y-4">

          <div>
            <label for="old-password" class="label-style"
                   data-translate-key="personal_info_old_password">{{ t.personal_info_old_password }}</label>
            <input type="password" id="old-password" v-model="oldPassword" required
                   class="input-style" :placeholder="t.personal_info_old_password_placeholder">
          </div>

          <div>
            <label for="new-password" class="label-style"
                   data-translate-key="personal_info_new_password">{{ t.personal_info_new_password }}</label>
            <input type="password" id="new-password" v-model="newPassword" required
                   class="input-style" :placeholder="t.personal_info_new_password_placeholder">
          </div>

          <div>
            <label for="confirm-password" class="label-style"
                   data-translate-key="personal_info_confirm_password">{{ t.personal_info_confirm_password }}</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" required
                   class="input-style" :placeholder="t.personal_info_confirm_password_placeholder">
          </div>

          <button type="submit" class="btn-primary"
                  data-translate-key="personal_info_change_password_button">{{ t.personal_info_change_password_button }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const userStore = useUserStore();
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const router = useRouter();

// 响应式数据
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const t = computed(() => settingsStore.currentTranslations);

/**
 * 【登出逻辑】 (重用 Sidebar 的逻辑)
 * 原 personal_info.html 的 4. 登出按钮逻辑
 */
const handleLogout = () => {
  if (confirm(t.value.alert_logout_confirm || '确定要登出吗？')) {
    userStore.logout();
    alert(t.value.alert_logout_success || '您已成功登出！');
    router.push('/login');
  }
};

/**
 * 【修改密码逻辑】
 * 原 personal_info.html 的 3. 修改密码逻辑
 */
const handleChangePassword = () => {
  // 1. 字段检查
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    alert(t.value.alert_fill_all || '请填写所有密码字段！');
    return;
  }

  // 2. 验证旧密码
  if (oldPassword.value !== userStore.userInfo.password) {
    alert(t.value.alert_old_password_error || '旧密码输入错误！');
    return;
  }

  // 3. 验证新密码一致性
  if (newPassword.value !== confirmPassword.value) {
    alert(t.value.alert_new_password_not_match || '两次输入的新密码不一致！');
    return;
  }

  // 4. 执行 Pinia Action 更新密码
  // 需要在 dataStore 中添加 updatePassword action
  const success = dataStore.updatePassword(userStore.currentUser, newPassword.value);

  if (success) {
    // 成功后登出并提示重新登录 (原 personal_info.html 逻辑)
    alert(t.value.alert_password_change_success || '密码修改成功！请使用新密码重新登录。');
    userStore.logout();
    router.push('/login');
  } else {
    // 失败（理论上 Pinia 不会失败，除非用户不存在，但以防万一）
    alert(t.value.alert_unknown_error || '发生未知错误，无法更新密码。');
  }
};
</script>

<style scoped>
/* 样式复用和定义 */
.info-item { @apply flex justify-between items-center py-2 border-b dark:border-gray-700; }
.info-label { @apply text-sm font-medium text-gray-500 dark:text-gray-400; }
.info-value { @apply text-base font-semibold text-gray-800 dark:text-white; }
.label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.input-style { @apply w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm input-focus dark:bg-gray-700 dark:border-gray-600 dark:text-white; }

/* 必须在 dataStore.js 中添加 updatePassword Action: */
/*
// src/stores/dataStore.js (补充 action)
updatePassword(username, newPassword) {
    const userIndex = this.users.findIndex(u => u.username === username);
    if (userIndex > -1) {
        this.users[userIndex].password = newPassword;
        this.persistUsers(); // 调用持久化方法
        return true;
    }
    return false;
}
*/
/* 确保 btn-primary 和 btn-danger 样式被导入或定义 (参考 LoginView.vue) */
.btn-primary {
  @apply bg-primary hover:bg-accent text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md;
}
.btn-danger {
  @apply bg-danger hover:bg-danger-hover text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md;
}
</style>
