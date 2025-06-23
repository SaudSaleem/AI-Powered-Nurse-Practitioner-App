# Setting Up OpenAI API Key

To use the AI features in NP Tutor, you need an OpenAI API key.

## Getting Your API Key

1. **Create an OpenAI Account**
   - Visit [https://platform.openai.com/](https://platform.openai.com/)
   - Sign up for a free account or log in

2. **Generate an API Key**
   - Go to [API Keys page](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Give it a name (e.g., "NP Tutor")
   - Copy the key immediately (you won't see it again!)

3. **Add Credits** (if needed)
   - OpenAI requires payment for API usage
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add a payment method and some credits ($5-10 is plenty for testing)

## Adding the Key to Your App

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your API key to the file:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Important Security Notes

- **Never commit** your `.env` file to version control
- **Never share** your API key publicly
- **Monitor usage** on the OpenAI dashboard to avoid unexpected charges
- For production, consider implementing a backend proxy to hide the API key

## Troubleshooting

- **"Invalid API Key"**: Double-check that you copied the entire key
- **"Insufficient quota"**: Add credits to your OpenAI account
- **CORS errors**: Make sure you're using the correct API URL

## Cost Estimation

- Each MCQ explanation costs approximately $0.001-0.002
- Chat messages cost approximately $0.0005-0.001 each
- A typical study session (50 questions + chat) costs less than $0.10 