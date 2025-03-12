require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const { openaiRouter } = require('./routes/openai');
const { geminiRouter } = require('./routes/gemini');
const { perplexityRouter } = require('./routes/perplexity');

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

// API Gateway route for unified model access
app.post('/api/chat', async (req, res) => {
  try {
    const { model, prompt, messageHistory } = req.body;
    
    logger.info(`Processing chat request using ${model} model`, {
      requestId: req.requestId,
      model,
      promptLength: prompt.length
    });
    
    let response;
    switch (model) {
      case 'openai':
        response = await fetch(`http://localhost:${PORT}/api/openai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, messageHistory })
        });
        break;
      case 'gemini':
        response = await fetch(`http://localhost:${PORT}/api/gemini/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, messageHistory })
        });
        break;
      case 'perplexity':
        response = await fetch(`http://localhost:${PORT}/api/perplexity/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: prompt })
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
