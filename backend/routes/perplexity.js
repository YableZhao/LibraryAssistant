const express = require('express');
const axios = require('axios');
const winston = require('winston');

const router = express.Router();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'perplexity-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/perplexity-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/perplexity.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Simple search endpoint that returns a link to Perplexity search
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    logger.info('Perplexity search request received', {
      requestId: req.requestId,
      queryLength: query.length
    });
    
    const searchURL = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
    const response = `Here are the search results from Perplexity AI:
[Click here to view the results](${searchURL})

Would you like me to help you refine your search or find specific resources?`;
    
    logger.info('Perplexity search successful', {
      requestId: req.requestId,
      responseLength: response.length
    });
    
    return res.json({ text: response });
  } catch (error) {
    logger.error('Perplexity API error', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: 'Failed to get response from Perplexity',
      details: error.message
    });
  }
});

// Advanced research endpoint that uses the Perplexity API
router.post('/research', async (req, res) => {
  try {
    const { query } = req.body;
    
    logger.info('Perplexity research request received', {
      requestId: req.requestId,
      queryLength: query.length
    });
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(400).json({ 
        error: 'Perplexity API key is not configured'
      });
    }
    
    const options = {
      method: 'POST',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: "llama-3.1-sonar-huge-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a research assistant. Focus on providing accurate information with citations and clickable links in JSON format. Respond with a JSON object containing 'summary' and 'references' as an array of {title, url}."
          },
          {
            role: "user",
            content: `Please summarize the topic '${query}' and provide some external references in JSON.`
          }
        ]
      }
    };

    const apiResponse = await axios(options);
    let content = apiResponse.data.choices[0].message.content.trim();
    content = content.replace(/^```json\s*/i, '').replace(/```$/, '');
    
    try {
      const parsed = JSON.parse(content);
      
      logger.info('Perplexity research successful', {
        requestId: req.requestId,
        summaryLength: parsed.summary.length,
        referencesCount: parsed.references.length
      });
      
      return res.json(parsed);
    } catch (parseError) {
      logger.error('Failed to parse Perplexity response', {
        requestId: req.requestId,
        error: parseError.message,
        content
      });
      
      return res.status(500).json({
        error: 'Failed to parse Perplexity response',
        details: parseError.message
      });
    }
  } catch (error) {
    logger.error('Perplexity research API error', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: 'Failed to get response from Perplexity',
      details: error.message
    });
  }
});

module.exports = { perplexityRouter: router };
