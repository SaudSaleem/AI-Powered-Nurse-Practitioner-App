import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mcqsData from '@/data/mcqs.json'

interface MCQ {
  id: number
  domain: string
  question: string
  options: Array<{ key: string; value: string }>
  correctAnswer: { key: string; value: string }
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const useAppStore = defineStore('app', () => {
  // State
  const user = ref<{ email: string } | null>(null)
  const mcqs = ref<MCQ[]>(mcqsData)
  const currentMCQIndex = ref(0)
  const chatMessages = ref<ChatMessage[]>([])
  const isChatOpen = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentMCQ = computed(() => mcqs.value[currentMCQIndex.value])
  const totalMCQs = computed(() => mcqs.value.length)
  const progress = computed(() => ((currentMCQIndex.value + 1) / totalMCQs.value) * 100)

  // Actions
  const login = (email: string) => {
    user.value = { email }
  }

  const logout = () => {
    user.value = null
    currentMCQIndex.value = 0
    chatMessages.value = []
  }

  const nextQuestion = () => {
    if (currentMCQIndex.value < mcqs.value.length - 1) {
      currentMCQIndex.value++
      chatMessages.value = [] // Clear chat for new question
    }
  }

  const previousQuestion = () => {
    if (currentMCQIndex.value > 0) {
      currentMCQIndex.value--
      chatMessages.value = [] // Clear chat for new question
    }
  }

  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value
  }

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    chatMessages.value.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    })
  }

  const clearChat = () => {
    chatMessages.value = []
  }

  return {
    // State
    user,
    mcqs,
    currentMCQIndex,
    chatMessages,
    isChatOpen,
    
    // Getters
    isAuthenticated,
    currentMCQ,
    totalMCQs,
    progress,
    
    // Actions
    login,
    logout,
    nextQuestion,
    previousQuestion,
    toggleChat,
    addChatMessage,
    clearChat
  }
}) 