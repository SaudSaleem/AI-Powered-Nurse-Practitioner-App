<template>
  <div class="exams-container">
    <!-- Header -->
    <div class="app-header">
      <div class="container flex flex-wrap align-items-center justify-content-between">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-heart-fill text-3xl text-primary"></i>
          <h1 class="text-2xl font-bold text-primary m-0">NP Tutor - Exams</h1>
        </div>
        
        <div class="flex align-items-center gap-3">
          <Button 
            label="Download JSON" 
            icon="pi pi-download" 
            severity="success" 
            outlined
            @click="downloadExamJSON"
            :disabled="examData.length === 0"
          />
          <Button 
            label="Exam Stats" 
            icon="pi pi-chart-bar" 
            severity="info" 
            outlined
            @click="showStatsDialog = true"
            :disabled="examData.length === 0"
          />
          <Button 
            label="Back to Home" 
            icon="pi pi-home" 
            severity="secondary" 
            text
            @click="goHome"
          />
        </div>
      </div>
    </div>

    <!-- Exam Selector -->
    <div class="exam-selector-section">
      <div class="container">
        <div class="flex align-items-center gap-3 mb-4">
          <label for="exam-select" class="font-semibold">Select Exam:</label>
          <Dropdown 
            id="exam-select"
            v-model="selectedExam" 
            :options="examOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Select an exam"
            class="w-12rem"
            @change="loadExamData"
          />
          <span class="text-600" v-if="examData.length > 0">
            ({{ filteredExamData.length }} of {{ examData.length }} questions)
          </span>
        </div>

        <!-- Filters -->
        <div v-if="examData.length > 0" class="filters-section">
          <div class="flex flex-wrap align-items-center gap-3 mb-3">
            <label class="font-semibold">Filters:</label>
            
            <!-- Model Filter -->
            <div class="flex align-items-center gap-2">
              <label for="model-filter" class="text-sm">Model:</label>
              <Dropdown 
                id="model-filter"
                v-model="selectedModel" 
                :options="modelOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="All Models"
                class="w-10rem"
                showClear
              />
            </div>

            <!-- Domain Filter -->
            <div class="flex align-items-center gap-2">
              <label for="domain-filter" class="text-sm">Domain:</label>
              <Dropdown 
                id="domain-filter"
                v-model="selectedDomain" 
                :options="domainOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="All Domains"
                class="w-12rem"
                showClear
              />
            </div>

            <!-- Clear Filters -->
            <Button 
              label="Clear Filters" 
              icon="pi pi-filter-slash" 
              severity="secondary" 
              size="small"
              outlined
              @click="clearFilters"
              v-if="selectedModel || selectedDomain"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- MCQs Display -->
    <div class="main-content" v-if="examData.length > 0">
      <div class="container">
        <div class="grid">
          <div 
            v-for="(mcq, displayIndex) in filteredExamData" 
            :key="mcq.originalIndex || displayIndex"
            class="col-12 mb-4"
          >
            <Card class="mcq-preview-card">
              <template #header>
                <div class="flex align-items-center justify-content-between p-3">
                  <div>
                    <span class="text-sm text-600">Question {{ displayIndex + 1 }}</span>
                    <h4 class="mt-1 mb-0 text-primary">{{ mcq.domain }} - {{ mcq.subdomain }}</h4>
                    <div class="flex gap-2 mt-2">
                      <Tag :value="mcq.type" severity="info" class="text-xs" />
                      <Tag :value="mcq.difficulty_level || mcq.difficulty || 'N/A'" severity="secondary" class="text-xs" />
                      <Tag :value="mcq.cognitive_level || mcq.cognitive || 'N/A'" severity="warning" class="text-xs" />
                      <Tag :value="mcq.model" severity="success" class="text-xs" />
                      <Tag v-if="mcq.revision" value="Has Notes" severity="danger" class="text-xs" />
                    </div>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <Button 
                      icon="pi pi-pencil" 
                      severity="warning" 
                      size="small" 
                      outlined
                      @click="editQuestion(mcq, mcq.originalIndex || displayIndex)"
                      v-tooltip.top="'Edit Question'"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      severity="danger" 
                      size="small" 
                      outlined
                      @click="confirmDeleteQuestion(mcq, mcq.originalIndex || displayIndex)"
                      v-tooltip.top="'Delete Question'"
                    />
                    <Avatar 
                      :label="String(displayIndex + 1)" 
                      shape="circle" 
                      size="large" 
                      style="background-color: black; color: white"
                    />
                  </div>
                </div>
              </template>
              
              <template #content>
                <!-- Case Scenario (if applicable) -->
                <div v-if="mcq.scenario" class="scenario-section mb-4 p-3 bg-blue-50 border-left-3 border-blue-500">
                  <h5 class="mt-0 mb-2 text-blue-800">
                    <i class="pi pi-file-text mr-2"></i>Case Scenario
                  </h5>
                  <p class="text-sm line-height-3 text-blue-900 m-0">{{ mcq.scenario }}</p>
                </div>

                <div class="question-text mb-4">
                  <p class="text-lg line-height-3">{{ mcq.question }}</p>
                </div>
                
                <div class="options-container">
                  <div 
                    v-for="option in mcq.options" 
                    :key="option.option"
                    class="option-item mb-3 p-3 border-round"
                    :class="getOptionClass(option, mcq)"
                  >
                    <div class="flex align-items-center gap-3">
                      <div class="option-letter">
                        <span class="font-semibold">{{ option.option }}.</span>
                      </div>
                      <label class="flex-1">
                        {{ option.description }}
                      </label>
                      <i v-if="isCorrectOption(option, mcq)" class="pi pi-check-circle text-green-500"></i>
                    </div>
                  </div>
                </div>

                <div class="mt-4 p-3 surface-100 border-round">
                  <div class="flex gap-2 align-items-center mb-2">
                    <strong class="text-primary">Correct Answer:</strong>
                    <span class="font-semibold text-green-600">{{ mcq.normalizedCorrectAnswer }}</span>
                  </div>
                  <div class="flex gap-4 text-sm text-600">
                    <span><strong>Context:</strong> {{ mcq.clinical_context }}</span>
                    <span><strong>Reference:</strong> {{ mcq.reference }}</span>
                  </div>
                  <div v-if="mcq.practice_statement" class="mt-2 text-sm text-600">
                    <strong>Practice Statement:</strong> {{ mcq.practice_statement }}
                  </div>
                  <div v-if="mcq.revision" class="mt-3 p-3 bg-orange-50 border-left-3 border-orange-500 border-round">
                    <h6 class="mt-0 mb-2 text-orange-800">
                      <i class="pi pi-pencil mr-2"></i>Revision Notes
                    </h6>
                    <p class="text-sm line-height-3 text-orange-900 m-0">{{ mcq.revision }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center mt-8">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="text-600 mt-2">Loading exam data...</p>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center mt-8">
      <i class="pi pi-file-excel text-6xl text-400 mb-3"></i>
      <p class="text-600">Select an exam to view questions</p>
    </div>

    <!-- Edit Question Dialog -->
    <Dialog 
      v-model:visible="showEditDialog" 
      header="Edit Question" 
      :style="{ width: '95vw', maxWidth: '1000px' }" 
      :modal="true"
      :closable="true"
      class="edit-dialog"
    >
      <div v-if="editingQuestion" class="edit-form">
        <!-- Case Scenario (if applicable) -->
        <div v-if="editingQuestion.scenario !== undefined" class="field mb-4">
          <label for="scenario" class="font-semibold mb-2 block">Case Scenario:</label>
          <Textarea 
            id="scenario"
            v-model="editingQuestion.scenario" 
            rows="7" 
            class="w-full"
            placeholder="Enter case scenario..."
          />
        </div>

        <!-- Question Text -->
        <div class="field mb-4">
          <label for="question" class="font-semibold mb-2 block">Question:</label>
          <Textarea 
            id="question"
            v-model="editingQuestion.question" 
            rows="7" 
            class="w-full"
            placeholder="Enter question text..."
          />
        </div>

        <!-- Options -->
        <div class="field mb-4">
          <label class="font-semibold mb-2 block">Options:</label>
          <div 
            v-for="(option, index) in editingQuestion.options" 
            :key="index"
            class="option-edit mb-3 p-3 border-1 border-200 border-round"
          >
            <div class="flex align-items-center gap-3 mb-2">
              <InputText 
                v-model="option.option" 
                class="w-3rem text-center"
                placeholder="A"
                disabled
              />
              <span class="font-semibold">Option {{ option.option }}:</span>
            </div>
            <Textarea 
              v-model="option.description" 
              rows="2" 
              class="w-full"
              :placeholder="`Enter option ${option.option} description...`"
            />
          </div>
        </div>

        <!-- Correct Answer -->
        <div class="field mb-4">
          <label for="correct-answer" class="font-semibold mb-2 block">Correct Answer:</label>
          <Dropdown 
            id="correct-answer"
            v-model="editingQuestion.normalizedCorrectAnswer" 
            :options="answerOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Select correct answer"
            class="w-full md:w-14rem"
          />
        </div>

        <!-- Additional Fields -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="clinical-context" class="font-semibold mb-2 block">Clinical Context:</label>
              <InputText 
                id="clinical-context"
                v-model="editingQuestion.clinical_context" 
                class="w-full"
                placeholder="Enter clinical context..."
              />
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="reference" class="font-semibold mb-2 block">Reference:</label>
              <InputText 
                id="reference"
                v-model="editingQuestion.reference" 
                class="w-full"
                placeholder="Enter reference..."
              />
            </div>
          </div>
        </div>

        <div class="field">
          <label for="practice-statement" class="font-semibold mb-2 block">Practice Statement:</label>
          <Textarea 
            id="practice-statement"
            v-model="editingQuestion.practice_statement" 
            rows="2" 
            class="w-full"
            placeholder="Enter practice statement..."
          />
        </div>

        <!-- Revision Notes -->
        <div class="field">
          <label for="revision" class="font-semibold mb-2 block">
            <i class="pi pi-pencil mr-2 text-orange-500"></i>Revision Notes:
          </label>
          <Textarea 
            id="revision"
            v-model="editingQuestion.revision" 
            rows="3" 
            class="w-full"
            placeholder="Enter any notes, revisions, or feedback for this question..."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            severity="secondary" 
            outlined
            @click="cancelEdit"
          />
          <Button 
            label="Save Changes" 
            icon="pi pi-check" 
            severity="success"
            @click="saveQuestionEdit"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="showDeleteDialog" 
      header="Confirm Deletion" 
      :style="{ width: '90vw', maxWidth: '500px' }" 
      :modal="true"
      :closable="true"
    >
      <div v-if="questionToDelete" class="confirmation-content">
        <div class="flex align-items-center gap-3 mb-4">
          <i class="pi pi-exclamation-triangle text-orange-500 text-3xl"></i>
          <div>
            <h4 class="mt-0 mb-2">Delete Question {{ questionToDelete.index + 1 }}?</h4>
            <p class="text-600 m-0">
              {{ questionToDelete.mcq.type }} - {{ questionToDelete.mcq.domain }} - {{ questionToDelete.mcq.subdomain }}
            </p>
          </div>
        </div>
        
        <div class="bg-red-50 border-left-3 border-red-500 p-3 border-round mb-4">
          <p class="text-red-800 text-sm m-0">
            <strong>Warning:</strong> This action cannot be undone. The question will be permanently removed from the exam.
          </p>
        </div>
        
        <div class="question-preview p-3 surface-100 border-round">
          <p class="font-semibold text-sm mb-2">Question Preview:</p>
          <p class="text-sm text-600 line-height-3">
            {{ questionToDelete.mcq.question.substring(0, 150) }}{{ questionToDelete.mcq.question.length > 150 ? '...' : '' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            severity="secondary" 
            outlined
            @click="cancelDelete"
          />
          <Button 
            label="Delete Question" 
            icon="pi pi-trash" 
            severity="danger"
            @click="deleteQuestion"
          />
        </div>
      </template>
    </Dialog>

    <!-- Statistics Dialog -->
    <Dialog 
      v-model:visible="showStatsDialog" 
      header="Exam Statistics" 
      :style="{ width: '90vw', maxWidth: '800px' }" 
      :modal="true"
      :closable="true"
    >
      <div v-if="examStats" class="stats-content">
        <!-- Overview -->
        <div class="stats-section mb-4">
          <h3 class="text-primary mb-3">
            <i class="pi pi-info-circle mr-2"></i>Overview
          </h3>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="stat-card p-3 bg-blue-50 border-round">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-list text-blue-600"></i>
                  <span class="font-semibold">Total MCQs:</span>
                  <span class="text-blue-600 font-bold">{{ examStats.totalMCQs }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="stat-card p-3 bg-green-50 border-round">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-cog text-green-600"></i>
                  <span class="font-semibold">Model:</span>
                  <span class="text-green-600 font-bold">{{ examStats.modelDistribution.Grok || 0 }} Grok</span>
                </div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-cog text-green-600"></i>
                  <span class="font-semibold">Model:</span>
                  <span class="text-green-600 font-bold">{{ examStats.modelDistribution.Gemini || 0 }} Gemini</span>
                </div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-cog text-green-600"></i>
                  <span class="font-semibold">Model:</span>
                  <span class="text-green-600 font-bold">{{ examStats.modelDistribution['Claude Opus4'] || 0 }} Claude Opus4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Domain Breakdown -->
        <div class="stats-section mb-4">
          <h3 class="text-primary mb-3">
            <i class="pi pi-chart-pie mr-2"></i>Domain Breakdown
          </h3>
          <div class="grid">
            <div 
              v-for="(domain, domainName) in examStats.domainBreakdown" 
              :key="domainName"
              class="col-12"
            >
              <div class="domain-card p-3 border-1 border-200 border-round mb-3">
                <div class="flex align-items-center justify-content-between mb-2">
                  <h4 class="text-primary m-0 capitalize">{{ domainName }}</h4>
                  <Tag :value="`${domain.total} questions`" severity="info" />
                </div>
                
                <div class="grid">
                  <div class="col-6">
                    <div class="text-sm">
                      <strong>Independent:</strong> {{ domain.independent }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-sm">
                      <strong>Case-based:</strong> {{ domain.case }}
                    </div>
                  </div>
                </div>

                <!-- Subdomain details for Clinician domain -->
                <div v-if="domainName.toLowerCase().includes('clinician') && domain.subdomains" class="mt-3">
                  <Divider />
                  <h5 class="text-600 mb-2">Subdomains:</h5>
                  <div class="grid">
                    <div 
                      v-for="(count, subdomain) in domain.subdomains" 
                      :key="subdomain"
                      class="col-12 md:col-6"
                    >
                      <div class="subdomain-item p-2 bg-gray-50 border-round mb-2">
                        <div class="flex align-items-center justify-content-between">
                          <span class="text-sm font-medium">{{ subdomain }}</span>
                          <Badge :value="count" severity="secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Types -->
        <div class="stats-section">
          <h3 class="text-primary mb-3">
            <i class="pi pi-tags mr-2"></i>Question Types
          </h3>
          <div class="grid">
            <div class="col-6">
              <div class="stat-card p-3 bg-purple-50 border-round text-center">
                <div class="text-purple-600 font-bold text-xl">{{ examStats.typeBreakdown.independent || 0 }}</div>
                <div class="text-sm text-600">Independent Questions</div>
              </div>
            </div>
            <div class="col-6">
              <div class="stat-card p-3 bg-orange-50 border-round text-center">
                <div class="text-orange-600 font-bold text-xl">{{ examStats.typeBreakdown.case || 0 }}</div>
                <div class="text-sm text-600">Case-based Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

interface ExamOption {
  label: string
  value: string
}

interface MCQOption {
  option: string
  description: string
}

interface CorrectAnswer {
  option: string
}

interface BaseMCQData {
  domain: string
  subdomain: string
  question: string
  options: MCQOption[]
  correct_answer?: string | CorrectAnswer
  correct?: string | CorrectAnswer
  difficulty_level?: string
  difficulty?: string
  cognitive_level?: string
  cognitive?: string
  clinical_context: string
  reference: string
  practice_statement?: string
  revision?: string
}

interface RegularMCQData extends BaseMCQData {
  model: string
  type: string
}

interface CaseQuestion extends BaseMCQData {
  // Case questions might have slightly different structure
}

interface CaseMCQData {
  model: string
  type: "case"
  scenario: string,
  domain?: string,
  questions: CaseQuestion[]
}

type MCQData = RegularMCQData | CaseMCQData

interface FlattenedMCQ extends BaseMCQData {
  model: string
  type: string
  scenario?: string
  isFromCase?: boolean
  caseIndex?: number
  // Normalized fields for easier access
  normalizedCorrectAnswer: string
  revision?: string // Custom field for teacher notes
  originalIndex?: number // Added for tracking original index
}

const router = useRouter()
const toast = useToast()
const selectedExam = ref<string>('exam-july-17')
const examData = ref<FlattenedMCQ[]>([])
const loading = ref<boolean>(false)
const showStatsDialog = ref<boolean>(false)
const showEditDialog = ref<boolean>(false)
const editingQuestion = ref<FlattenedMCQ | null>(null)
const editingQuestionIndex = ref<number>(-1)
const showDeleteDialog = ref<boolean>(false)
const questionToDelete = ref<{ mcq: FlattenedMCQ; index: number } | null>(null)

const examOptions = ref<ExamOption[]>([
  { label: 'July 17 Exam', value: 'exam-july-17' }
])

const answerOptions = ref([
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' }
])

const modelOptions = ref([
  { label: 'All Models', value: '' },
  { label: 'Grok', value: 'Grok' },
  { label: 'Claude Opus4', value: 'Claude Opus4' },
  { label: 'Gemini', value: 'Gemini' }
])

// Function to get the main domain category from any domain variation
const getDomainCategory = (domain: string): string => {
  if (!domain) return 'unknown'
  
  const lowerDomain = domain.toLowerCase().trim()
  console.log(lowerDomain)
  // Check for domain keywords using includes for flexibility
  if (lowerDomain.includes('clinician')) return 'Clinician'
  if (lowerDomain.includes('leader')) return 'Leader'
  if (lowerDomain.includes('quality') || lowerDomain.includes('improvement') || lowerDomain.includes('research') || lowerDomain.includes('scholar')) return 'Quality Improvement and Research/Scholar'
  if (lowerDomain.includes('educator')) return 'Educator'
  if (lowerDomain.includes('advocate')) return 'Advocate'
  
  // If no match found, return the original domain (cleaned up)
  return domain.trim()
}

const domainOptions = computed(() => {
  const domainCategories = examData.value.map(mcq => getDomainCategory(mcq.domain || ''))
  const uniqueDomains = [...new Set(domainCategories)]
  return [
    { label: 'All Domains', value: '' },
    ...uniqueDomains.sort().map(domain => ({ label: domain, value: domain }))
  ]
})

const selectedModel = ref<string>('')
const selectedDomain = ref<string>('')

const filteredExamData = computed(() => {
  let filtered = examData.value.map((mcq, index) => ({
    ...mcq,
    originalIndex: index
  }))

  if (selectedModel.value) {
    filtered = filtered.filter(mcq => mcq.model === selectedModel.value)
  }

  if (selectedDomain.value) {
    filtered = filtered.filter(mcq => getDomainCategory(mcq.domain || '') === selectedDomain.value)
  }

  return filtered
})

const flattenExamData = (rawData: MCQData[]): FlattenedMCQ[] => {
  const flattened: FlattenedMCQ[] = []
  
  const normalizeCorrectAnswer = (correct: string | CorrectAnswer | undefined): string => {
    if (!correct) return ''
    if (typeof correct === 'string') return correct
    if (typeof correct === 'object' && correct.option) return correct.option
    return ''
  }
  
  rawData.forEach((item, index) => {
    if (item.type.includes('case')) {
      // Handle case-based questions
      const caseData = item as CaseMCQData
      caseData.questions.forEach((question, qIndex) => {
        flattened.push({
          ...question,
          model: caseData.model,
          type: caseData.type,
          domain: question.domain || (caseData?.domain as string),
          scenario: caseData.scenario,
          isFromCase: true,
          caseIndex: index,
          // Normalize the correct answer field
          normalizedCorrectAnswer: normalizeCorrectAnswer(question.correct || question.correct_answer),
          difficulty_level: question.difficulty || question.difficulty_level || 'N/A',
          cognitive_level: question.cognitive || question.cognitive_level || 'N/A'
        })
      })
    } else {
      // Handle regular MCQs
      const regularData = item as RegularMCQData
      flattened.push({
        ...regularData,
        isFromCase: false,
        // Normalize fields
        normalizedCorrectAnswer: normalizeCorrectAnswer(regularData.correct_answer || regularData.correct),
        difficulty_level: regularData.difficulty_level || 'N/A',
        cognitive_level: regularData.cognitive_level || 'N/A'
      })
    }
  })
  
  return flattened
}

const loadExamData = async (): Promise<void> => {
  if (!selectedExam.value) {
    examData.value = []
    return
  }

  loading.value = true
  // Clear filters when loading new exam
  clearFilters()
  
  try {
    const response = await import(`@/data/exams/${selectedExam.value}.json`)
    const rawData: MCQData[] = response.default || response
    examData.value = flattenExamData(rawData)
    console.log('Loaded exam data:', examData.value.length, 'questions')
  } catch (error) {
    console.error('Error loading exam data:', error)
    examData.value = []
  } finally {
    loading.value = false
  }
}

const getOptionClass = (option: MCQOption, mcq: FlattenedMCQ) => {
  const isCorrect = isCorrectOption(option, mcq)
  return {
    'surface-50': !isCorrect,
    'surface-100': !isCorrect,
    'surface-card': !isCorrect,
    'correct-option': isCorrect,
    'border-1 border-solid': true
  }
}

const isCorrectOption = (option: MCQOption, mcq: FlattenedMCQ): boolean => {
  return option.option === mcq.normalizedCorrectAnswer
}

const goHome = (): void => {
  router.push('/home')
}

const editQuestion = (mcq: FlattenedMCQ, index: number): void => {
  editingQuestion.value = { ...mcq }
  editingQuestionIndex.value = index
  showEditDialog.value = true
}

const cancelEdit = (): void => {
  editingQuestion.value = null
  editingQuestionIndex.value = -1
  showEditDialog.value = false
}

const saveQuestionEdit = (): void => {
  if (!editingQuestion.value) return

  const originalIndex = examData.value.findIndex((q, index) => index === editingQuestionIndex.value)
  if (originalIndex === -1) {
    console.error('Question not found for editing:', editingQuestion.value)
    return
  }

  // Update both the normalized field and the original field
  const updatedQuestion = { ...editingQuestion.value }
  
  // Update the original correct answer field based on what field exists
  if (updatedQuestion.correct_answer !== undefined) {
    updatedQuestion.correct_answer = updatedQuestion.normalizedCorrectAnswer
  } else if (updatedQuestion.correct !== undefined) {
    updatedQuestion.correct = { option: updatedQuestion.normalizedCorrectAnswer }
  }

  const updatedExamData = [...examData.value]
  updatedExamData[originalIndex] = updatedQuestion
  examData.value = updatedExamData

  showEditDialog.value = false
  editingQuestion.value = null
  editingQuestionIndex.value = -1
  
  toast.add({ 
    severity: 'success', 
    summary: 'Updated', 
    detail: 'Question updated successfully.', 
    life: 3000 
  })
}

const confirmDeleteQuestion = (mcq: FlattenedMCQ, index: number): void => {
  questionToDelete.value = { mcq, index }
  showDeleteDialog.value = true
}

const cancelDelete = (): void => {
  questionToDelete.value = null
  showDeleteDialog.value = false
}

const deleteQuestion = (): void => {
  if (!questionToDelete.value) return

  const indexToDelete = questionToDelete.value.index
  examData.value.splice(indexToDelete, 1)
  
  showDeleteDialog.value = false
  questionToDelete.value = null
  
  toast.add({ 
    severity: 'success', 
    summary: 'Deleted', 
    detail: 'Question deleted successfully.', 
    life: 3000 
  })
}

const downloadExamJSON = (): void => {
  if (examData.value.length === 0) {
    toast.add({ severity: 'info', summary: 'No Data', detail: 'No exam data to download.', life: 3000 })
    return
  }

  // Reconstruct the original data structure
  const reconstructedData: MCQData[] = []
  const caseGroups = new Map<number, FlattenedMCQ[]>()
  const independentQuestions: FlattenedMCQ[] = []

  // Group questions by type
  examData.value.forEach(mcq => {
    if (mcq.isFromCase && mcq.caseIndex !== undefined) {
      if (!caseGroups.has(mcq.caseIndex)) {
        caseGroups.set(mcq.caseIndex, [])
      }
      caseGroups.get(mcq.caseIndex)!.push(mcq)
    } else {
      independentQuestions.push(mcq)
    }
  })

  // Add independent questions
  independentQuestions.forEach(mcq => {
    const originalQuestion: RegularMCQData = {
      model: mcq.model,
      domain: mcq.domain,
      subdomain: mcq.subdomain,
      type: mcq.type,
      question: mcq.question,
      options: mcq.options,
      correct_answer: mcq.correct_answer || mcq.normalizedCorrectAnswer,
      correct: mcq.correct || { option: mcq.normalizedCorrectAnswer },
      difficulty_level: mcq.difficulty_level === 'N/A' ? undefined : mcq.difficulty_level,
      difficulty: mcq.difficulty === 'N/A' ? undefined : mcq.difficulty,
      cognitive_level: mcq.cognitive_level === 'N/A' ? undefined : mcq.cognitive_level,
      cognitive: mcq.cognitive === 'N/A' ? undefined : mcq.cognitive,
      clinical_context: mcq.clinical_context,
      reference: mcq.reference,
      practice_statement: mcq.practice_statement,
      revision: mcq.revision // Include revision notes
    }

    // Clean up undefined fields
    Object.keys(originalQuestion).forEach(key => {
      if (originalQuestion[key as keyof RegularMCQData] === undefined) {
        delete originalQuestion[key as keyof RegularMCQData]
      }
    })

    reconstructedData.push(originalQuestion)
  })

  // Add case-based questions
  caseGroups.forEach((questions, caseIndex) => {
    if (questions.length > 0) {
      const firstQuestion = questions[0]
      const caseData: CaseMCQData = {
        model: firstQuestion.model,
        type: "case",
        scenario: firstQuestion.scenario || '',
        questions: questions.map(mcq => {
          const caseQuestion: CaseQuestion = {
            domain: mcq.domain,
            subdomain: mcq.subdomain,
            question: mcq.question,
            options: mcq.options,
            correct: mcq.correct || { option: mcq.normalizedCorrectAnswer },
            correct_answer: mcq.correct_answer || mcq.normalizedCorrectAnswer,
            difficulty: mcq.difficulty === 'N/A' ? undefined : mcq.difficulty,
            difficulty_level: mcq.difficulty_level === 'N/A' ? undefined : mcq.difficulty_level,
            cognitive: mcq.cognitive === 'N/A' ? undefined : mcq.cognitive,
            cognitive_level: mcq.cognitive_level === 'N/A' ? undefined : mcq.cognitive_level,
            clinical_context: mcq.clinical_context,
            reference: mcq.reference,
            practice_statement: mcq.practice_statement,
            revision: mcq.revision // Include revision notes
          }

          // Clean up undefined fields
          Object.keys(caseQuestion).forEach(key => {
            if (caseQuestion[key as keyof CaseQuestion] === undefined) {
              delete caseQuestion[key as keyof CaseQuestion]
            }
          })

          return caseQuestion
        })
      }
      reconstructedData.push(caseData)
    }
  })

  const data = JSON.stringify(reconstructedData, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedExam.value}-edited.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.add({ 
    severity: 'success', 
    summary: 'Downloaded', 
    detail: 'Exam data downloaded successfully.', 
    life: 3000 
  })
}

const clearFilters = (): void => {
  selectedModel.value = ''
  selectedDomain.value = ''
}

// Load default exam on mount
onMounted(() => {
  loadExamData()
})

interface ExamStats {
  totalMCQs: number
  modelDistribution: Record<string, number>
  domainBreakdown: Record<string, {
    total: number
    independent: number
    case: number
    subdomains?: Record<string, number>
  }>
  typeBreakdown: {
    independent: number
    case: number
  }
}

const examStats = computed<ExamStats | null>(() => {
  if (filteredExamData.value.length === 0) return null

  const stats: ExamStats = {
    totalMCQs: filteredExamData.value.length,
    modelDistribution: {},
    domainBreakdown: {},
    typeBreakdown: {
      independent: 0,
      case: 0
    }
  }

  // Count by model
  filteredExamData.value.forEach(mcq => {
    const model = mcq.model || 'Unknown'
    stats.modelDistribution[model] = (stats.modelDistribution[model] || 0) + 1
  })

  // Count by domain and type
  filteredExamData.value.forEach(mcq => {
    const originalDomain = mcq.domain || 'Unknown'
    const domainCategory = getDomainCategory(originalDomain)
    if(mcq.domain?.includes('Quality')){
        console.log('domainCategory', domainCategory, 'originalDomain', originalDomain)
        console.log('mcq', mcq)
    }
    if (mcq.domain === undefined){
        console.log('domainCategory NOT', domainCategory, 'originalDomain', originalDomain)
        console.log('mcq', mcq)
    }
    const type = mcq.type || 'unknown'
    const subdomain = mcq.subdomain

    // Initialize domain if not exists
    if (!stats.domainBreakdown[domainCategory]) {
      stats.domainBreakdown[domainCategory] = {
        total: 0,
        independent: 0,
        case: 0
      }
    }

    // Count domain totals
    stats.domainBreakdown[domainCategory].total++

    // Count by type
    if (type.toLowerCase() === 'independent') {
      stats.domainBreakdown[domainCategory].independent++
      stats.typeBreakdown.independent++
    } else if (type.toLowerCase().includes('case')) {
      stats.domainBreakdown[domainCategory].case++
      stats.typeBreakdown.case++
    }

    // Count subdomains for Clinician domain
    if (domainCategory === 'Clinician' && subdomain) {
      if (!stats.domainBreakdown[domainCategory].subdomains) {
        stats.domainBreakdown[domainCategory].subdomains = {}
      }
      stats.domainBreakdown[domainCategory].subdomains[subdomain] = 
        (stats.domainBreakdown[domainCategory].subdomains[subdomain] || 0) + 1
    }
  })

  return stats
})
</script>

<style scoped>
.exams-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #616164 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.exam-selector-section {
  padding: 16px;
}

.exam-selector-section .container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.filters-section {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.filters-section .flex {
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters-section label {
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.filters-section .p-dropdown {
  min-width: 120px;
}

.main-content {
  padding: 1rem 0 4rem;
}

.mcq-preview-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mcq-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.option-item {
  transition: all 0.2s ease;
}

.option-letter {
  min-width: 24px;
}

.scenario-section {
  border-radius: 8px;
}

.scenario-section h5 {
  color: #1976d2;
  font-weight: 600;
}

.scenario-section p {
  color: #0d47a1;
  font-style: italic;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.stats-content {
  max-height: 70vh;
  overflow-y: auto;
}

.stats-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.stats-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.domain-card {
  background: #fafafa;
  transition: box-shadow 0.2s ease;
}

.domain-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subdomain-item {
  border: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.subdomain-item:hover {
  background-color: #e9ecef !important;
}

.edit-dialog .p-dialog-content {
  padding: 1rem;
}

.edit-form .field {
  margin-bottom: 1rem;
}

.edit-form .field label {
  font-size: 0.875rem;
  color: #495057;
}

.edit-form .field .p-inputtext {
  font-size: 1rem;
}

.edit-form .field .p-textarea {
  font-size: 1rem;
}

.edit-form .field .p-dropdown {
  width: 100%;
}

.edit-form .field .p-dropdown .p-dropdown-label {
  font-size: 1rem;
}

.edit-form .field .p-dropdown .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem;
}

.edit-form .field .p-dropdown .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem;
}

.option-edit {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.option-edit .p-inputtext {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.option-edit .p-textarea {
  font-size: 0.875rem;
  color: #333;
}

.option-edit .p-dropdown {
  width: 100%;
}

.option-edit .p-dropdown .p-dropdown-label {
  font-size: 0.875rem;
}

.option-edit .p-dropdown .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem;
}

.option-edit .p-dropdown .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem;
}

/* Styling for correct options */
.correct-option {
  background-color: #dcfce7 !important; /* light green background */
  border-color: #16a34a !important; /* green border */
  color: #15803d !important; /* dark green text */
}

.correct-option .option-letter,
.correct-option label {
  color: #15803d !important; /* ensure all text is visible */
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .exam-selector-section .container {
    margin: 0 1rem;
  }
  
  .main-content .container {
    padding: 0 0.5rem;
  }

  .filters-section .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .filters-section .flex > div {
    width: 100%;
  }

  .filters-section .p-dropdown {
    min-width: 100px;
    width: 100%;
  }
}

/* Styling for correct options */
</style> 