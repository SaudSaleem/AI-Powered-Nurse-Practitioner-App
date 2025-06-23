<template>
  <div class="chatbot-container">
    <!-- Chat Toggle Button -->
    <Button 
      v-if="!isOpen"
      class="chat-toggle-button"
      icon="pi pi-comments"
      rounded
      severity="primary"
      @click="toggleChat"
      v-tooltip.left="'Ask AI Tutor'"
    />
    
    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header flex align-items-center justify-content-between p-3">
        <div class="flex align-items-center gap-2">
          <Avatar icon="pi pi-robot" shape="circle" style="background-color: #667eea; color: white" />
          <span class="font-semibold text-white">AI Tutor</span>
        </div>
        <Button 
          icon="pi pi-times" 
          severity="secondary" 
          text 
          rounded
          @click="toggleChat"
          style="color: white"
        />
      </div>
      
      <div class="chat-messages p-3" ref="messagesContainer">
        <div v-if="messages.length === 0" class="text-center text-600 mt-3">
          <i class="pi pi-comments text-4xl mb-2"></i>
          <p>Ask me anything about this question!</p>
        </div>
        
        <div v-for="message in messages" :key="message.id" class="message-item mb-3">
          <div v-if="message.role === 'user'" class="user-message">
            <div class="message-bubble user-bubble p-3">
              {{ message.content }}
            </div>
          </div>
          
          <div v-else class="ai-message">
            <div class="flex align-items-start gap-2">
              <Avatar icon="pi pi-robot" size="small" shape="circle" style="background-color: #667eea; color: white" />
              <div class="message-bubble ai-bubble p-3" v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>
        
        <div v-if="isLoading" class="ai-message">
          <div class="flex align-items-start gap-2">
            <Avatar icon="pi pi-robot" size="small" shape="circle" style="background-color: #667eea; color: white" />
            <div class="message-bubble ai-bubble p-3">
              <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input p-3">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <Textarea 
            v-model="inputMessage" 
            placeholder="Type your question..."
            rows="2"
            class="flex-1"
            @keydown.enter.prevent="sendMessage"
            :disabled="isLoading"
          />
          <Button 
            type="submit"
            icon="pi pi-send" 
            rounded
            :disabled="!inputMessage.trim() || isLoading"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import openAIService from '@/services/openai.service'

const appStore = useAppStore()

const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

const isOpen = computed(() => appStore.isChatOpen)
const messages = computed(() => appStore.chatMessages)
const currentMCQ = computed(() => appStore.currentMCQ)

const toggleChat = () => {
  appStore.toggleChat()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userMessage = inputMessage.value
  inputMessage.value = ''
  
  // Add user message
  appStore.addChatMessage({
    role: 'user',
    content: userMessage
  })
  
  // Scroll to bottom
  await scrollToBottom()
  
  // Get AI response
  isLoading.value = true
  try {
    const context = `Current MCQ:\nQuestion: ${currentMCQ.value.question}\nOptions: ${currentMCQ.value.options.map(o => `${o.key}. ${o.value}`).join(', ')}\nCorrect Answer: ${currentMCQ.value.correctAnswer.key}`
    
    const chatHistory = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    const response = await openAIService.getChatResponse(
      [...chatHistory, { role: 'user', content: userMessage }],
      context
    )
    
    appStore.addChatMessage({
      role: 'assistant',
      content: response
    })
    
    await scrollToBottom()
  } catch (error) {
    console.error('Chat error:', error)
    appStore.addChatMessage({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please check your API key and try again.'
    })
  } finally {
    isLoading.value = false
  }
}

const formatMessage = (text: string) => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for new messages and scroll
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.chat-toggle-button {
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chat-window {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 380px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
}

.message-bubble {
  max-width: 80%;
  word-wrap: break-word;
  border-radius: 12px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  background: #667eea;
  color: white;
}

.ai-bubble {
  background: white;
  border: 1px solid #e0e0e0;
}

.chat-input {
  border-top: 1px solid #e0e0e0;
  background: white;
}

@media (max-width: 768px) {
  .chatbot-container {
    bottom: 1rem;
    right: 1rem;
  }
  
  .chat-window {
    width: calc(100vw - 2rem);
    max-width: 380px;
    height: 70vh;
    max-height: 500px;
  }
}

.message-bubble :deep(strong) {
  font-weight: 600;
}

.message-bubble :deep(br) {
  margin-bottom: 0.5rem;
}
</style> 