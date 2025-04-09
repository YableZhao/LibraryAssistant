require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const { openaiRouter } = require('./routes/openai');
const { geminiRouter } = require('./routes/gemini');
const { perplexityRouter } = require('./routes/perplexity');
const { ragRouter } = require('./routes/rag');
const { enhancePromptWithKnowledge } = require('./services/ragService');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'utlib-assistant-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware with request ID
app.use((req, res, next) => {
  req.requestId = Date.now().toString();
  next();
});

// Morgan HTTP request logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[x-request-id]'));

// Routes
app.use('/api/openai', openaiRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/perplexity', perplexityRouter);
app.use('/api/rag', ragRouter);

// API Gateway route for unified model access
app.post('/api/chat', async (req, res) => {
  try {
    const { model, prompt, messageHistory } = req.body;
    
    logger.info(`Processing chat request using ${model} model`, {
      requestId: req.requestId,
      model,
      promptLength: prompt.length
    });
    
    // Check if the query seems library-related to consider using RAG
    const lowerPrompt = prompt.toLowerCase();
    const isLibraryQuery = lowerPrompt.includes('library') || 
                          lowerPrompt.includes('book') || 
                          lowerPrompt.includes('research') || 
                          lowerPrompt.includes('article') || 
                          lowerPrompt.includes('ut') || 
                          lowerPrompt.includes('university');
    
    // Potentially enhance the prompt with RAG if it's library-related
    let enhancedPromptData = { enhancedPrompt: prompt, sources: [], hasKnowledge: false };
    if (isLibraryQuery) {
      enhancedPromptData = await enhancePromptWithKnowledge(prompt, model);
      logger.info(`Enhanced prompt with RAG: ${enhancedPromptData.hasKnowledge}`, {
        requestId: req.requestId,
        sourceCount: enhancedPromptData.sources.length
      });
    }
    
    // Use the enhanced prompt if available
    const finalPrompt = enhancedPromptData.enhancedPrompt;
    
    let response;
    switch (model) {
      case 'openai':
        response = await fetch(`http://localhost:${PORT}/api/openai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: finalPrompt, messageHistory })
        });
        break;
      case 'gemini':
        response = await fetch(`http://localhost:${PORT}/api/gemini/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: finalPrompt, messageHistory })
        });
        break;
      case 'perplexity':
        response = await fetch(`http://localhost:${PORT}/api/perplexity/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: finalPrompt })
        });
        break;
      default:
        return res.status(400).json({ error: `Unsupported model: ${model}` });
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      logger.error(`Error from ${model} service`, {
        requestId: req.requestId,
        statusCode: response.status,
        error: errorData
      });
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    logger.info(`Successfully processed ${model} request`, {
      requestId: req.requestId,
      responseLength: data.text.length
    });
    
    // Add sources to the response if they exist
    if (enhancedPromptData && enhancedPromptData.sources && enhancedPromptData.sources.length > 0) {
      data.sources = enhancedPromptData.sources;
    }
    
    // Prepare the response based on the JSON structure
    return res.json(data);
  } catch (error) {
    logger.error('Error processing chat request', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
