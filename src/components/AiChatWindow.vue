<template>
  <button
    id="ai-chat-btn"
    @click="isChatOpen = true"
    v-if="!isChatOpen"
    class="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-accent text-white shadow-xl hover:bg-primary transition-all duration-300"
    :title="t.ai_chat_title"
  >
    <i class="fa fa-commenting-o text-2xl"></i>
  </button>

  <div
    v-if="isChatOpen"
    id="ai-chat-window"
    class="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-gray-800 shadow-2xl rounded-xl flex flex-col z-50 transition-all duration-300 border border-primary/50"
  >
    <div class="p-3 border-b dark:border-gray-700 flex items-center justify-between bg-neutral dark:bg-gray-700 rounded-t-xl">
      <h3 class="font-semibold text-gray-900 dark:text-white">{{ t.ai_chat_title }}</h3>
      <button @click="isChatOpen = false" id="ai-chat-close-btn" class="text-gray-500 hover:text-danger dark:text-gray-300">
        <i class="fa fa-times text-lg"></i>
      </button>
    </div>

    <div id="ai-chat-messages" ref="messagesContainer" class="flex-1 p-3 overflow-y-auto space-y-3">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex"
        :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] p-3 rounded-lg shadow-sm"
          :class="msg.sender === 'user'
            ? 'bg-accent text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'"
        >
          {{ msg.text }}
        </div>
      </div>
      <div v-if="isThinking" class="flex justify-start">
        <div class="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none">
          <i class="fa fa-spinner fa-spin mr-2"></i> {{ t.ai_thinking || '思考中...' }}
        </div>
      </div>
    </div>

    <div class="p-3 border-t dark:border-gray-700 flex">
      <input
        type="text"
        id="ai-chat-input"
        v-model="inputMessage"
        :placeholder="t.ai_input_placeholder"
        @keyup.enter="sendMessage"
        :disabled="isThinking"
        class="input-style flex-1 mr-2"
      >
      <button
        id="ai-chat-send-btn"
        @click="sendMessage"
        :disabled="!inputMessage.trim() || isThinking"
        class="btn-primary w-12 flex items-center justify-center p-0"
      >
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

// Hooks
const settingsStore = useSettingsStore();
const t = computed(() => settingsStore.currentTranslations);

const isChatOpen = ref(false);
const inputMessage = ref('');
const messages = ref([
  { sender: 'ai', text: t.value.ai_initial_greeting || '你好！我是Kimi AI，我可以帮你查询图书、作者等信息。' }
]);
const isThinking = ref(false);
const messagesContainer = ref(null); // 用于自动滚动

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

/**
 * 发送消息并获取 AI 回复 (取代原 page.html 的 generateAiResponse 函数)
 */
const sendMessage = async () => {
  const userText = inputMessage.value.trim();
  if (!userText) return;

  // 1. 显示用户消息
  messages.value.push({ sender: 'user', text: userText });
  inputMessage.value = '';
  isThinking.value = true;
  scrollToBottom();

  try {
    // 2. 发送请求到 Node.js 后端 (原项目中的 Kimi API 调用)
    // 假设后端运行在 /api/kimi-chat
    const response = await fetch('/api/kimi-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userText }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const aiResponse = data.response || t.value.alert_ai_no_response || '抱歉，AI未能给出明确回复。';

    // 3. 显示 AI 回复
    messages.value.push({ sender: 'ai', text: aiResponse });

  } catch (error) {
    console.error('AI Chat Error:', error);
    // 4. 显示错误信息 (原 page.html 的错误处理逻辑)
    messages.value.push({
      sender: 'ai',
      text: t.value.alert_ai_service_error || '抱歉，AI服务当前似乎出了点问题，请稍后再试。'
    });
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
};

// 确保初始问候语在语言加载后立即显示
watch(t, () => {
  if (messages.value.length === 1 && messages.value[0].sender === 'ai') {
    messages.value[0].text = t.value.ai_initial_greeting || '你好！我是Kimi AI，我可以帮你查询图书、作者等信息。';
  }
}, { immediate: true });

</script>
