const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const winston = require('winston');

const router = express.Router();

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-pro-002',
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'gemini-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/gemini-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/gemini.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Gemini chat completion endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, messageHistory = [] } = req.body;
    
    logger.info('Gemini request received', {
      requestId: req.requestId,
      promptLength: prompt.length
    });
    
    // Format conversation history
    const pastMessagesText = messageHistory.map(m => {
      const role = m.sender === 'user' ? 'User' : 'Assistant';
      return `${role}: ${m.text}`;
    }).join('\n\n');

    // Create enriched prompt
    const enrichedPrompt = `
You are a helpful, context-aware University of Texas at Austin Library assistant. 
Keep the conversation natural and context-rich, reflecting back on previous user messages if needed.

Conversation so far:
${pastMessagesText}

User's latest question: ${prompt}

Please give a clear, concise, and friendly response.
`;

    const result = await model.generateContent(enrichedPrompt);
    const response = await result.response.text();
    
    logger.info('Gemini request successful', {
      requestId: req.requestId,
      responseLength: response.length
    });
    
    return res.json({ text: response });
  } catch (error) {
    logger.error('Gemini API error', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: 'Failed to get response from Gemini',
      details: error.message
    });
  }
});

module.exports = { geminiRouter: router };
