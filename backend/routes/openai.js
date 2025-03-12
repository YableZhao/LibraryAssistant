const express = require('express');
const OpenAI = require('openai');
const winston = require('winston');

const router = express.Router();

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'openai-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/openai-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/openai.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// OpenAI chat completion endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    logger.info('OpenAI request received', {
      requestId: req.requestId,
      promptLength: prompt.length
    });
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Be concise and friendly in your responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150
    });
    
    const response = completion.choices[0].message.content;
    
    logger.info('OpenAI request successful', {
      requestId: req.requestId,
      responseLength: response.length
    });
    
    return res.json({ text: response });
  } catch (error) {
    logger.error('OpenAI API error', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: 'Failed to get response from OpenAI',
      details: error.message
    });
  }
});

module.exports = { openaiRouter: router };
