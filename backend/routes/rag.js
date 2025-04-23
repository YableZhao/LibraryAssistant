/**
 * RAG (Retrieval Augmented Generation) Routes
 * Endpoints for managing the knowledge base and RAG operations
 */

const express = require('express');
const winston = require('winston');
const multer = require('multer');
const path = require('path');
const { 
  addWebpageToKnowledgeBase, 
  queryKnowledgeBase,
  addTextFileToKnowledgeBase 
} = require('../services/ragService');

const router = express.Router();

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename but add timestamp to avoid conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

// Add a text file to the knowledge base
router.post('/add-textfile', upload.single('textFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Text file is required' });
    }

    const filePath = req.file.path;
    logger.info(`Adding text file: ${filePath}`, { 
      requestId: req.requestId, 
      originalName: req.file.originalname 
    });
    
    const result = await addTextFileToKnowledgeBase(filePath);
    
    // Optional: Clean up the uploaded file after processing
    // const fs = require('fs').promises;
    // await fs.unlink(filePath);

    if (result.success) {
      return res.json({ 
        message: `Successfully added text file to knowledge base`,
        count: result.count,
        fileName: req.file.originalname,
        storedPath: filePath
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to add text file to knowledge base',
        details: result.error
      });
    }
  } catch (error) {
    logger.error('Error in add-textfile endpoint', { 
      error: error.message,
      requestId: req.requestId 
    });
    // Attempt to clean up file on error too
    if (req.file && req.file.path) {
      try {
        const fs = require('fs').promises;
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to cleanup uploaded file after error', { filePath: req.file.path, cleanupError: cleanupError.message });
      }
    }
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
