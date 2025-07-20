import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice'

// PrimeVue Components
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import RadioButton from 'primevue/radiobutton'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Avatar from 'primevue/avatar'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import Tooltip from 'primevue/tooltip'
import Toast from 'primevue/toast'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'

// PrimeVue CSS
// import 'primevue/resources/themes/lara-light-blue/theme.css'
// import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false, // Disable automatic dark mod
    }
  }
})
app.use(ToastService)

// Register PrimeVue components globally
app.component('Button', Button)
app.component('Card', Card)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('RadioButton', RadioButton)
app.component('Dialog', Dialog)
app.component('Message', Message)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Avatar', Avatar)
app.component('Textarea', Textarea)
app.component('ProgressBar', ProgressBar)
app.component('Toast', Toast)
app.component('Dropdown', Dropdown)
app.component('Tag', Tag)
app.component('Badge', Badge)
app.component('Divider', Divider)

// Register PrimeVue directives
app.directive('tooltip', Tooltip)

app.mount('#app')
