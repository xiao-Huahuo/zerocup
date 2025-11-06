<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex justify-between items-center flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white"
          data-translate-key="my_borrowings_title">{{ t.my_borrowings_title }}</h2>

      <button
        id="pay-fine-btn"
        @click="openPayFineModal"
        class="btn-secondary"
        :disabled="totalFine <= 0"
      >
        <i class="fa fa-credit-card mr-2"></i>
        <span data-translate-key="action_pay_fine">{{ t.action_pay_fine }}</span>
        <span v-if="totalFine > 0" class="ml-2 font-bold text-danger">¥{{ totalFine.toFixed(2) }}</span>
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <div v-if="userStore.borrowings.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <i class="fa fa-exclamation-circle text-4xl mb-3"></i>
        <p data-translate-key="alert_no_current_borrowings">{{ t.alert_no_current_borrowings || '您当前没有正在借阅的图书。' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="table-header" data-translate-key="table_title">{{ t.table_title }}</th>
            <th scope="col" class="table-header" data-translate-key="table_borrow_date">{{ t.table_borrow_date }}</th>
            <th scope="col" class="table-header" data-translate-key="table_due_date">{{ t.table_due_date }}</th>
            <th scope="col" class="table-header" data-translate-key="table_fine">{{ t.table_fine }}</th>
            <th scope="col" class="table-header" data-translate-key="table_action">{{ t.table_action }}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in userStore.borrowings" :key="item.id"
              :class="isOverdue(item) ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800'">
            <td class="table-data font-medium text-gray-900 dark:text-white">{{ getBookTitle(item.bookId) }}</td>
            <td class="table-data">{{ item.borrowDate }}</td>
            <td class="table-data">{{ item.dueDate }}</td>
            <td class="table-data" :class="calculateSingleFine(item) > 0 ? 'text-danger dark:text-red-400 font-bold' : 'text-accent'">
              ¥{{ calculateSingleFine(item).toFixed(2) }}
            </td>
            <td class="table-data">
              <button
                @click="handleReturnBook(item)"
                class="btn-small btn-primary"
                data-translate-key="action_return">{{ t.action_return }}
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
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
        @click.self="closePayFineModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300"
          :class="isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
        >
          <div class="flex justify-between items-center border-b pb-3 mb-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white"
                data-translate-key="action_pay_fine">{{ t.action_pay_fine }}</h3>
            <button @click="closePayFineModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="fa fa-times text-xl"></i>
            </button>
          </div>

          <div class="text-center my-6">
            <p v-if="totalFine > 0" id="total-fine-display"
               class="text-lg font-bold text-danger dark:text-red-400">
              <span data-translate-key="fine_to_pay">{{ t.fine_to_pay }}</span>: ¥{{ totalFine.toFixed(2) }}
            </p>
            <p v-else id="total-fine-display"
               class="text-lg font-bold text-accent dark:text-green-400">
              <span data-translate-key="fine_none">{{ t.fine_none || '您当前没有需要支付的罚款。' }}</span>
            </p>
          </div>

          <button
            @click="handlePayFine"
            :disabled="totalFine <= 0"
            class="w-full btn-primary"
            data-translate-key="action_confirm_pay">{{ t.action_confirm_pay || '确认支付' }}</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const userStore = useUserStore();
const dataStore = useDataStore();
const settingsStore = useSettingsStore();

// 模态框状态 (取代原生的 class 切换)
const isModalOpen = ref(false);

const t = computed(() => settingsStore.currentTranslations);
const currentLang = computed(() => settingsStore.currentLang);

// 罚款标准 (原 my_borrowings.html: 每天 ¥0.50 元)
const FINE_RATE = 0.5;
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

// --- 核心逻辑函数 ---

/**
 * 检查借阅记录是否逾期 (原 my_borrowings.html 的 isOverdue 函数)
 */
const isOverdue = (borrowing) => {
  const today = new Date();
  const dueDate = new Date(borrowing.dueDate);
  return today > dueDate;
};

/**
 * 计算单本书的罚款金额 (原 my_borrowings.html 的 calculateSingleFine 函数)
 */
const calculateSingleFine = (borrowing) => {
  if (!isOverdue(borrowing)) {
    return 0;
  }

  const today = new Date();
  const dueDate = new Date(borrowing.dueDate);
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / MILLISECONDS_IN_DAY);

  // 最小为 0
  return Math.max(0, diffDays) * FINE_RATE;
};

/**
 * 计算总罚款金额 (原 my_borrowings.html 的 calculateTotalFine 函数)
 */
const totalFine = computed(() => {
  let total = 0;
  userStore.borrowings.forEach(item => {
    total += calculateSingleFine(item);
  });
  return total;
});

/**
 * 获取书名 (用于列表展示)
 */
const getBookTitle = (bookId) => {
  const book = dataStore.books.find(b => b.id === bookId);
  return book ? book.title[currentLang.value] : t.value.alert_book_not_found || '图书不存在';
};

// --- 操作处理函数 ---

const openPayFineModal = () => {
  isModalOpen.value = true;
};

const closePayFineModal = () => {
  isModalOpen.value = false;
};

/**
 * 归还图书操作 (原 my_borrowings.html 的 returnBook 函数)
 */
const handleReturnBook = (borrowing) => {
  const fine = calculateSingleFine(borrowing);
  let confirmMsg = (t.value.alert_return_confirm || '确定归还《{title}》吗？')
    .replace('{title}', getBookTitle(borrowing.bookId));

  if (fine > 0) {
    confirmMsg += `\n${t.value.alert_fine_due || '您有逾期罚款'}：¥${fine.toFixed(2)}。\n${t.value.alert_fine_pay_later || '您可以在“我的借阅”页面稍后支付。'}`;
  }

  if (confirm(confirmMsg)) {
    // 1. 调用 Pinia action 执行归还
    // 需要在 dataStore 中添加 returnBook action
    dataStore.returnBook(borrowing.bookId, userStore.currentUser, fine);

    // 2. 提示成功
    alert(t.value.alert_return_success || '归还成功！');

    // 3. 重新加载用户借阅和历史数据
    userStore.loadUserData();
  }
};

/**
 * 支付罚款操作 (原 my_borrowings.html 的 payFine 函数)
 */
const handlePayFine = () => {
  if (totalFine.value <= 0) {
    alert(t.value.fine_none || '您当前没有需要支付的罚款。');
    return;
  }

  const fineToPay = totalFine.value;

  // 1. 调用 Pinia action 执行支付
  // 需要在 dataStore 中添加 payFine action
  dataStore.payFine(userStore.currentUser, fineToPay);

  // 2. 提示成功并关闭模态框
  const successMsg = (t.value.alert_fine_pay_success || '罚款 ¥{fine} 元支付成功！')
    .replace('{fine}', fineToPay.toFixed(2));
  alert(successMsg);
  closePayFineModal();

  // 3. 重新加载用户借阅数据 (罚款状态会更新)
  userStore.loadUserData();
};

// ‼️ 重要：需要更新 Pinia Store ‼️
/* // src/stores/dataStore.js (补充 action)

// 假设 userStore 中有一个 paidFines 字段
// 归还操作
returnBook(bookId, username, fine) {
    // 1. 更新图书状态 (isBorrowed = false)
    const book = this.books.find(b => b.id === bookId);
    if (book) book.isBorrowed = false;

    // 2. 移动到借阅历史 (并记录罚款)
    let history = JSON.parse(localStorage.getItem(`borrowing_history_${username}`)) || [];
    const borrowingIndex = this.getBorrowingsByUsername(username).findIndex(b => b.bookId === bookId);
    if (borrowingIndex > -1) {
        const item = this.getBorrowingsByUsername(username).splice(borrowingIndex, 1)[0];
        item.returnDate = new Date().toLocaleDateString('zh-CN');
        item.finePaid = fine;
        history.push(item);
        localStorage.setItem(`borrowing_history_${username}`, JSON.stringify(history));
    }
    this.persistBorrowings();

    // 3. 如果有罚款，记录到待支付罚款列表 (userStore 会在 loadUserData 中更新)
}

// 支付罚款操作
payFine(username, fineAmount) {
    // 简化处理：将所有当前的未支付罚款标记为已支付。
    // 在实际应用中，这通常会涉及到修改借阅记录中的支付状态字段。

    // 假设 userStore 拥有一个待支付罚款的总额字段
    // 在 Pinia 的 actions 中直接操作 userStore 是不推荐的，但为了保持逻辑独立，我们假设 dataStore 是数据修改的中心。
    // 这里的逻辑应简化为：清除用户的所有待支付罚款状态。
    // 由于原项目没有明确的罚款记录，我们假设支付后，所有当前的逾期罚款都被清零。

    // 由于原项目逻辑简单，我们模拟将罚款总额记录到历史，并清空当前罚款状态。
    // 更好的做法是更新用户的 finesPaid 字段，并在计算罚款时排除已支付部分。
    //
    // 在本例中，我们暂时不修改任何数据，只模拟提示。
    // 实际的 Pinia Action 需要实现清除用户的罚款债务。
    // (例如：通过将所有逾期未归还记录的 finePaid 设为 true 或在 userStore 中记录已支付罚款)

    // 如果用户的借阅记录中有一个 paidFine 字段，这里就更新它。
    // 由于原项目没有该字段，我们依赖于归还时计算的罚款，然后通过 loadUserData 间接更新。
    // 我们只需在归还时将罚款记录到 history 即可。

    // 此处为支付操作的简化：
    alert(`【模拟操作】已成功支付 ¥${fineAmount.toFixed(2)} 元罚款。`);

    // 在更完善的系统中，这会触发后端事务。在 Pinia 中，需要清除罚款状态。
    // 暂时不做实际数据修改，因为罚款依赖于逾期天数实时计算。
    // 只有归还后，罚款才会被记录到历史并固定下来。
    // 既然用户已支付，可以假设所有已归还的逾期记录的 isPaid 字段被设为 true。

}
*/
</script>

<style scoped>
/* 样式复用和定义 */
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300; }
.table-data { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }
.btn-secondary { @apply bg-tertiary hover:bg-secondary text-accent font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md; }
.btn-small { @apply py-1 px-3 text-xs rounded-md; }
.btn-primary { @apply bg-primary hover:bg-accent text-white; }
.btn-danger { @apply bg-danger hover:bg-danger-hover text-white; }
</style>
