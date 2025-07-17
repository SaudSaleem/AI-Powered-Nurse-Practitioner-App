<template>
  <div class="login-container">
    <Card class="login-card">
      <template #header>
        <div class="text-center">
          <i class="pi pi-heart-fill text-6xl text-primary mb-3"></i>
          <h1 class="text-4xl font-bold text-primary mb-2">NP Tutor</h1>
          <p class="text-lg text-600">AI-Powered Nurse Practitioner Exam Prep</p>
        </div>
      </template>
      
      <template #content>
        <form @submit.prevent="handleLogin" class="p-fluid">
          <div class="field">
            <label for="email" class="block text-900 font-medium mb-2">Email or Username</label>
            <InputText 
              id="email" 
              v-model="email" 
              type="email" 
              placeholder="Enter your email"
              class="w-full"
              :class="{ 'p-invalid': emailError }"
              @input="emailError = ''"
            />
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>
          
          <Button 
            type="submit" 
            label="Login" 
            icon="pi pi-sign-in" 
            class="w-full mt-5"
            :loading="isLoading"
          />
        </form>
      </template>
      
      <template #footer>
        <div class="text-center text-600 text-sm">
          <p>This is a prototype. No actual authentication is performed.</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

const email = ref('sunny@gmail.com')
const emailError = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  // Basic validation
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  
  if (!email.value.includes('@')) {
    emailError.value = 'Please enter a valid email'
    return
  }
  
  // Simulate login process
  isLoading.value = true
  
  setTimeout(() => {
    appStore.login(email.value)
    router.push('/exams')
  }, 100)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-card :deep(.p-card-header) {
  background: white;
  padding: 2rem 2rem 1rem 2rem;
}

.login-card :deep(.p-card-content) {
  padding: 1rem 2rem 2rem 2rem;
}

.login-card :deep(.p-card-footer) {
  background: #f8f9fa;
  padding: 1rem 2rem;
}
</style> 