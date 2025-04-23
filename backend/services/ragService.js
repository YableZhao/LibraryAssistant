/**
 * RAG (Retrieval Augmented Generation) Service
 * Enhances AI responses with relevant knowledge from a document database
 */

const { OpenAIEmbeddings } = require('@langchain/openai');
const { CheerioWebBaseLoader } = require('@langchain/community/document_loaders/web/cheerio');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { PromptTemplate } = require('@langchain/core/prompts');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'rag-service' },
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

// Initialize embeddings - we'll use OpenAI's embeddings for quality
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chroma Server URL (Default for local development)
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';

// Collection name
const COLLECTION_NAME = 'ut_library_knowledge';

// Singleton instance for the vector store
let vectorStore;

/**
 * Initialize and return the singleton Chroma vector store instance connected via HTTP.
 */
async function getVectorStore() {
  if (!vectorStore) {
    try {
      // Try to connect to an existing collection at the Chroma server URL
      logger.info(`Attempting to connect to existing Chroma collection '${COLLECTION_NAME}' at ${CHROMA_URL}...`);
      vectorStore = await Chroma.fromExistingCollection(embeddings, {
        collectionName: COLLECTION_NAME,
        url: CHROMA_URL,
      });
      logger.info(`Successfully connected to existing Chroma collection '${COLLECTION_NAME}'.`);
    } catch (initError) {
      // If connecting failed, assume the collection doesn't exist and create it
      logger.warn(`Collection '${COLLECTION_NAME}' likely doesn't exist. Attempting to create it by adding dummy document... Error: ${initError.message}`);
      try {
        vectorStore = await Chroma.fromDocuments([], embeddings, { // Empty array to just create collection
          collectionName: COLLECTION_NAME,
          url: CHROMA_URL,
        });
        logger.info(`Successfully created and connected to new Chroma collection '${COLLECTION_NAME}'.`);
      } catch (createError) {
        logger.error(`FATAL: Failed to create or connect to Chroma collection '${COLLECTION_NAME}' at ${CHROMA_URL}. Error: ${createError.message}`, { stack: createError.stack });
        throw new Error(`Failed to initialize Chroma vector store via HTTP: ${createError.message}`);
      }
    }
  }
  return vectorStore;
}

/**
 * Add a webpage to the knowledge base
 * @param {string} url URL to fetch and index
 */
async function addWebpageToKnowledgeBase(url) {
  try {
    logger.info(`Adding webpage to knowledge base: ${url}`);
    
    // Load the webpage
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    
    // Split into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Add metadata to each document
    const enhancedDocs = splitDocs.map(doc => {
      doc.metadata.source = url;
      doc.metadata.added_at = new Date().toISOString();
      return doc;
    });
    
    // Get the vector store
    const store = await getVectorStore();
    
    // Add documents to the vector store
    await store.addDocuments(enhancedDocs);
    
    logger.info(`Successfully added ${enhancedDocs.length} chunks from ${url}`);
    return { success: true, count: enhancedDocs.length };
  } catch (error) {
    logger.error('Error adding webpage to knowledge base', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Add a text file to the knowledge base
 * @param {string} filePath Path to the text file to index
 */
async function addTextFileToKnowledgeBase(filePath) {
  try {
    logger.info(`Adding text file to knowledge base: ${filePath}`);
    
    // Load the text file
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
    
    // Split into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Add metadata to each document
    const enhancedDocs = splitDocs.map(doc => {
      // TextLoader might add some metadata already, let's preserve it
      doc.metadata = { 
        ...(doc.metadata || {}), 
        source: filePath, // Override or set the source
        added_at: new Date().toISOString() 
      };
      return doc;
    });
    
    // Get the vector store
    const store = await getVectorStore();
    
    // Add documents to the vector store
    await store.addDocuments(enhancedDocs);
    
    logger.info(`Successfully added ${enhancedDocs.length} chunks from ${filePath}`);
    return { success: true, count: enhancedDocs.length };
  } catch (error) {
    logger.error('Error adding text file to knowledge base', { filePath, error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Query the knowledge base for relevant information
 * @param {string} query The user query
 * @param {number} limit Maximum number of results to return
 * @returns {Promise<{documents: Array, success: boolean}>}
 */
async function queryKnowledgeBase(query, limit = 3) {
  try {
    logger.info(`Querying knowledge base: ${query}`);
    
    // Get the vector store
    const store = await getVectorStore();
    
    // Search for relevant documents
    const results = await store.similaritySearch(query, limit);
    
    logger.info(`Found ${results.length} relevant documents`);
    return { success: true, documents: results };
  } catch (error) {
    logger.error('Error querying knowledge base', { error: error.message });
    return { success: false, error: error.message, documents: [] };
  }
}

/**
 * Enhance a prompt with relevant knowledge
 * @param {string} userQuery The original user query
 * @param {string} modelType The model type (openai, gemini, etc.)
 * @returns {Promise<{enhancedPrompt: string, sources: Array}>}
 */
async function enhancePromptWithKnowledge(userQuery, modelType = 'gemini') {
  try {
    // Query the knowledge base
    const { documents, success } = await queryKnowledgeBase(userQuery);
    
    // If no documents found or query failed, return original prompt
    if (!success || documents.length === 0) {
      return { 
        enhancedPrompt: userQuery,
        sources: [],
        hasKnowledge: false
      };
    }
    
    // Extract content from documents
    const contextText = documents.map(doc => doc.pageContent).join('\n\n');
    
    // Template for enhanced prompt
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant for the University of Texas Library.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}

Your answer should be helpful, accurate, and based on the provided context. Include citations [1], [2], etc. to reference which part of the context you're using.
    `);
    
    // Format the prompt
    const enhancedPrompt = await promptTemplate.format({
      context: contextText,
      question: userQuery
    });
    
    // Extract sources for citation
    const sources = documents.map((doc, index) => ({
      id: index + 1,
      title: doc.metadata.source || 'Unknown Source',
      url: doc.metadata.source || '#',
      snippet: doc.pageContent.substring(0, 150) + '...'
    }));
    
    logger.info('Enhanced prompt with knowledge base information');
    return { 
      enhancedPrompt, 
      sources,
      hasKnowledge: true
    };
  } catch (error) {
    logger.error('Error enhancing prompt', { error: error.message });
    return { 
      enhancedPrompt: userQuery,
      sources: [],
      hasKnowledge: false
    };
  }
}

module.exports = {
  addWebpageToKnowledgeBase,
  addTextFileToKnowledgeBase,
  queryKnowledgeBase,
  enhancePromptWithKnowledge
};
