/**
 * RAG (Retrieval Augmented Generation) Routes
 * Endpoints for managing the knowledge base and RAG operations
 */

const express = require('express');
const winston = require('winston');
const { addWebpageToKnowledgeBase, queryKnowledgeBase } = require('../services/ragService');

const router = express.Router();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'rag-routes' },
  transports: [
    new winston.transports.File({ filename: 'logs/rag-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/rag.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add a webpage to the knowledge base
router.post('/add-webpage', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Adding webpage: ${url}`, { requestId: req.requestId });
    const result = await addWebpageToKnowledgeBase(url);
    
    if (result.success) {
      return res.json({ 
        message: `Successfully added webpage to knowledge base`,
        count: result.count,
        url
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to add webpage to knowledge base',
        details: result.error
      });
    }
  } catch (error) {
    logger.error('Error in add-webpage endpoint', { 
      error: error.message,
      requestId: req.requestId 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Search the knowledge base
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 3 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    logger.info(`Searching knowledge base: ${query}`, { requestId: req.requestId });
    const result = await queryKnowledgeBase(query, limit);
    
    if (result.success) {
      // Format results for API response
      const formattedResults = result.documents.map(doc => ({
        content: doc.pageContent,
        source: doc.metadata.source || 'Unknown',
        addedAt: doc.metadata.added_at || 'Unknown'
      }));
      
      return res.json({ results: formattedResults });
    } else {
      return res.status(500).json({ 
        error: 'Failed to search knowledge base',
        details: result.error
      });
    }
  } catch (error) {
    logger.error('Error in search endpoint', { 
      error: error.message,
      requestId: req.requestId 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { ragRouter: router };
