<template>
  <div class="home-container">
    <!-- Header -->
    <div class="app-header">
      <div class="container flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-heart-fill text-3xl text-primary"></i>
          <h1 class="text-2xl font-bold text-primary m-0">NP Tutor</h1>
        </div>
        
        <div class="flex align-items-center gap-3">
          <span class="text-600">{{ user?.email }}</span>
          <Button 
            label="View Exams" 
            icon="pi pi-file-text" 
            severity="secondary" 
            text
            @click="goToExams"
          />
          <Button 
            label="Logout" 
            icon="pi pi-sign-out" 
            severity="secondary" 
            text
            @click="handleLogout"
          />
        </div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="container">
        <div class="flex align-items-center justify-content-between mb-2">
          <span class="text-600">Progress</span>
          <span class="text-600">{{ currentMCQIndex + 1 }} / {{ totalMCQs }}</span>
        </div>
        <ProgressBar :value="progress" :showValue="false" style="height: 8px" />
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <MCQCard 
          v-if="currentMCQ"
          :mcq="currentMCQ"
          :currentQuestion="currentMCQIndex + 1"
          :totalQuestions="totalMCQs"
          @next="nextQuestion"
          @previous="previousQuestion"
          @answered="handleAnswered"
        />
      </div>
    </div>
    
    <!-- Chatbot -->
    <Chatbot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import MCQCard from '@/components/MCQCard.vue'
import Chatbot from '@/components/Chatbot.vue'
import ProgressBar from 'primevue/progressbar'

const router = useRouter()
const appStore = useAppStore()

const user = computed(() => appStore.user)
const currentMCQ = computed(() => appStore.currentMCQ)
const currentMCQIndex = computed(() => appStore.currentMCQIndex)
const totalMCQs = computed(() => appStore.totalMCQs)
const progress = computed(() => appStore.progress)

const handleLogout = () => {
  appStore.logout()
  router.push('/login')
}

const nextQuestion = () => {
  appStore.nextQuestion()
}

const previousQuestion = () => {
  appStore.previousQuestion()
}

const handleAnswered = (data: { isCorrect: boolean; selectedOption: string }) => {
  // You can add logic here to track user performance
  console.log('Question answered:', data)
}

const goToExams = () => {
  router.push('/exams')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.app-header {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.progress-section {
  background: white;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.main-content {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}
</style>
