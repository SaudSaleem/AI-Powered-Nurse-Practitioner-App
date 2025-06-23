import axios from 'axios'
import { API_CONFIG } from '@/config/api'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MCQExplanationRequest {
  question: string
  options: Array<{ key: string; value: string }>
  correctAnswer: { key: string; value: string }
  selectedAnswer?: { key: string; value: string }
}

export class OpenAIService {
  private apiKey: string
  private apiUrl: string
  private model: string
  private systemPrompt: string

  constructor() {
    this.apiKey = API_CONFIG.openai.apiKey
    this.apiUrl = API_CONFIG.openai.apiUrl
    this.model = API_CONFIG.openai.model
    this.systemPrompt = API_CONFIG.openai.systemPrompt
  }

  async getExplanation(data: MCQExplanationRequest): Promise<string> {
    const userPrompt = this.buildExplanationPrompt(data)
    
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to get explanation from AI')
    }
  }

  async getChatResponse(messages: ChatMessage[], context?: string): Promise<string> {
    try {
      const systemMessage = context 
        ? `${this.systemPrompt}\n\nCurrent context: ${context}`
        : this.systemPrompt

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemMessage },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to get chat response from AI')
    }
  }

  private buildExplanationPrompt(data: MCQExplanationRequest): string {
    const optionsText = data.options
      .map(opt => `${opt.key}. ${opt.value}`)
      .join('\n')

    return `
Question: ${data.question}

Options:
${optionsText}

Correct Answer: ${data.correctAnswer.key}. ${data.correctAnswer.value}

${data.selectedAnswer && data.selectedAnswer.key !== data.correctAnswer.key 
  ? `The student selected: ${data.selectedAnswer.key}. ${data.selectedAnswer.value}`
  : ''}

Please provide a detailed explanation of why ${data.correctAnswer.key} is the correct answer. Include:
1. Why the correct answer is right
2. Why other options are incorrect
3. Clinical reasoning and pathophysiology
4. Key concepts for Nurse Practitioners to remember

Format your response in a clear, educational manner suitable for exam preparation.
`
  }
}

export default new OpenAIService() 