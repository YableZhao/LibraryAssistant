# UT Library AI Assistant Backend

Backend service for the UT Austin Library AI Assistant, providing API integration with multiple AI models.

## Features

- Express.js server with modular routing
- Integration with multiple AI services:
  - OpenAI
  - Google Gemini
  - Perplexity
- Centralized logging with Winston
- API request proxying and response formatting
- Error handling and request validation

## Getting Started

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

The server will be available at http://localhost:5000.

## API Endpoints

- **POST /api/openai/chat**
  - OpenAI Chat Completion API
  
- **POST /api/gemini/chat**
  - Google Gemini Generation API
  
- **POST /api/perplexity/search**
  - Perplexity Search API
  
- **POST /api/perplexity/research**
  - Perplexity Research API

## Docker

Build and run with Docker:

```bash
docker build -t ut-library-backend .
docker run -p 5000:5000 --env-file .env ut-library-backend
```

## Development

- Add new routes in the `/routes` directory
- Update server.js to include new routes
- Use winston logging for consistent log format
