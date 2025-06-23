<template>
  <Card class="mcq-card">
    <template #header>
      <div class="flex align-items-center justify-content-between">
        <div>
          <span class="text-sm text-600">Question {{ currentQuestion }} of {{ totalQuestions }}</span>
          <h3 class="mt-2 mb-0 text-primary">{{ mcq.domain }}</h3>
        </div>
        <Avatar 
          :label="String(currentQuestion)" 
          shape="circle" 
          size="large" 
          style="background-color: #667eea; color: white"
        />
      </div>
    </template>
    
    <template #content>
      <div class="question-text mb-4">
        <p class="text-lg line-height-3">{{ mcq.question }}</p>
      </div>
      
      <div class="options-container">
        <div 
          v-for="option in mcq.options" 
          :key="option.key"
          class="option-item mb-3 p-3 border-round cursor-pointer transition-all transition-duration-200"
          :class="getOptionClass(option)"
          @click="!answered && selectOption(option)"
        >
          <div class="flex align-items-center gap-3">
            <RadioButton 
              :value="option.key" 
              v-model="selectedOption" 
              :disabled="answered"
            />
            <label class="flex-1 cursor-pointer">
              <span class="font-semibold">{{ option.key }}.</span> {{ option.value }}
            </label>
            <i v-if="answered && option.key === mcq.correctAnswer.key" class="pi pi-check-circle text-green-500"></i>
            <i v-if="answered && selectedOption === option.key && option.key !== mcq.correctAnswer.key" class="pi pi-times-circle text-red-500"></i>
          </div>
        </div>
      </div>
      
      <div v-if="answered" class="mt-4">
        <Message v-if="isCorrect" severity="success" :closable="false">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span>Correct! Well done!</span>
          </div>
        </Message>
        
        <Message v-else severity="error" :closable="false">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-times-circle"></i>
            <span>Incorrect. The correct answer is {{ mcq.correctAnswer.key }}.</span>
          </div>
        </Message>
        
        <div v-if="explanation" class="explanation-box mt-3 p-3 surface-50 border-round">
          <h4 class="mt-0 mb-3 text-primary">AI Explanation</h4>
          <div class="explanation-content" v-html="formatExplanation(explanation)"></div>
        </div>
        
        <div v-if="loadingExplanation" class="text-center mt-3">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
          <p class="text-600 mt-2">Getting AI explanation...</p>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-content-between">
        <Button 
          label="Previous" 
          icon="pi pi-chevron-left" 
          @click="$emit('previous')"
          :disabled="currentQuestion === 1"
          severity="secondary"
        />
        <Button 
          v-if="answered"
          label="Next Question" 
          icon="pi pi-chevron-right" 
          iconPos="right"
          @click="$emit('next')"
          :disabled="currentQuestion === totalQuestions"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import openAIService from '@/services/openai.service'

interface MCQ {
  id: number
  domain: string
  question: string
  options: Array<{ key: string; value: string }>
  correctAnswer: { key: string; value: string }
}

const props = defineProps<{
  mcq: MCQ
  currentQuestion: number
  totalQuestions: number
}>()

const emit = defineEmits<{
  next: []
  previous: []
  answered: [{ isCorrect: boolean; selectedOption: string }]
}>()

const selectedOption = ref<string>('')
const answered = ref(false)
const explanation = ref('')
const loadingExplanation = ref(false)

const isCorrect = computed(() => selectedOption.value === props.mcq.correctAnswer.key)

const selectOption = async (option: { key: string; value: string }) => {
  selectedOption.value = option.key
  answered.value = true
  
  emit('answered', { 
    isCorrect: isCorrect.value, 
    selectedOption: selectedOption.value 
  })
  
  // Get AI explanation if incorrect
  if (!isCorrect.value) {
    loadingExplanation.value = true
    try {
      explanation.value = await openAIService.getExplanation({
        question: props.mcq.question,
        options: props.mcq.options,
        correctAnswer: props.mcq.correctAnswer,
        selectedAnswer: option
      })
    } catch (error) {
      console.error('Failed to get explanation:', error)
      explanation.value = 'Unable to get AI explanation. Please check your API key.'
    } finally {
      loadingExplanation.value = false
    }
  }
}

const getOptionClass = (option: { key: string; value: string }) => {
  if (!answered.value) {
    return 'option-default'
  }
  
  if (option.key === props.mcq.correctAnswer.key) {
    return 'option-correct'
  }
  
  if (selectedOption.value === option.key && option.key !== props.mcq.correctAnswer.key) {
    return 'option-incorrect'
  }
  
  return 'option-disabled'
}

const formatExplanation = (text: string) => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+\.)/gm, '<br><strong>$1</strong>')
}

// Reset state when question changes
watch(() => props.mcq.id, () => {
  selectedOption.value = ''
  answered.value = false
  explanation.value = ''
  loadingExplanation.value = false
})
</script>

<style scoped>
.mcq-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.question-text {
  font-size: 1.1rem;
  color: var(--text-color);
}

.option-item {
  border: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.option-default:hover {
  border-color: var(--primary-color);
  background: var(--surface-50);
}

.option-correct {
  border-color: var(--green-500);
  background: var(--green-50);
}

.option-incorrect {
  border-color: var(--red-500);
  background: var(--red-50);
}

.option-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.explanation-box {
  border-left: 4px solid var(--primary-color);
}

.explanation-content {
  line-height: 1.6;
  color: var(--text-color-secondary);
}

.explanation-content :deep(strong) {
  color: var(--text-color);
}

.explanation-content :deep(br) {
  margin-bottom: 0.5rem;
}
</style> 