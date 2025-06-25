# NP Tutor - AI-Powered Nurse Practitioner Exam Prep

An AI-powered web application designed to help Canadian Nurse Practitioner students prepare for their licensing exam. The app features multiple choice questions (MCQs) with AI-generated explanations and a chatbot for additional support.

## Features

- 🔐 **Mock Login System** - Simple email-based login (no real authentication)
- 📚 **MCQ Practice** - Multiple choice questions across various NP domains
- 🤖 **AI Explanations** - OpenAI-powered explanations for incorrect answers
- 💬 **AI Chatbot** - Ask follow-up questions about the current MCQ
- 📊 **Progress Tracking** - Visual progress bar for quiz completion
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **UI Library**: PrimeVue
- **Styling**: PrimeFlex CSS utilities
- **AI Integration**: OpenAI API (GPT-3.5)
- **HTTP Client**: Axios
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   cd np-tutor-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OpenAI API**
   
   Create a `.env` file in the project root:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Building for Production

1. **Build the project**
   ```bash
   npm run build
   ```

   This creates an optimized production build in the `dist` directory.

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## Deploying to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase in the project**
   ```bash
   firebase init hosting
   ```
   
   When prompted:
   - Select your Firebase project or create a new one
   - Set public directory to `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite `index.html`

3. **Deploy to Firebase**
   ```bash
   npm run build
   firebase deploy
   ```

## Project Structure

```
np-tutor-app/
├── src/
│   ├── assets/          # CSS and static assets
│   ├── components/      # Vue components
│   │   ├── MCQCard.vue  # MCQ display component
│   │   └── Chatbot.vue  # AI chatbot component
│   ├── config/          # Configuration files
│   ├── data/            # MCQ data (JSON)
│   ├── router/          # Vue Router configuration
│   ├── services/        # API services
│   ├── stores/          # Pinia stores
│   ├── views/           # Page components
│   │   ├── LoginView.vue
│   │   └── HomeView.vue
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Static files
├── .env                 # Environment variables (create this)
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## Adding New MCQs

MCQs are stored in `src/data/mcqs.json`. To add new questions, follow this format:

```json
{
  "id": 6,
  "domain": "Domain Name",
  "question": "Your question text here?",
  "options": [
    { "key": "A", "value": "First option" },
    { "key": "B", "value": "Second option" },
    { "key": "C", "value": "Third option" },
    { "key": "D", "value": "Fourth option" }
  ],
  "correctAnswer": { "key": "B", "value": "Second option" }
}
```

## Customization

- **Theme**: Modify colors in `src/assets/main.css`
- **AI Prompts**: Update system prompts in `src/config/api.ts`
- **MCQ Domains**: Add new domains by updating the MCQ data

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in `.env`
- **CORS Errors**: The app makes direct API calls to OpenAI, which should work from the browser
- **Build Errors**: Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## License

This is a prototype application for educational purposes.
