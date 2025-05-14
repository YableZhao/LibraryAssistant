/**
 * AI Service Layer - Calls AI services through the backend API
 */

// Get the backend API base URL
// Get the backend API base URL, ensuring the path is correct
const getApiBaseUrl = () => {
  // If the environment variable exists
  if (process.env.REACT_APP_BACKEND_URL) {
    const url = process.env.REACT_APP_BACKEND_URL;
    console.log('Original backend URL:', url);
    // Check if the URL already ends with /api
    if (url.endsWith('/api')) {
      return url;
    } else {
      // Add /api prefix
      return `${url}/api`;
    }
  }
  // Default value
  return '/api';
};
const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);

// Logging function
const logError = (error, context) => {
  console.error(`AI Service Error (${context}):`, error);
};

// Helper function to handle API responses
const handleApiResponse = async (response, context) => {
  console.log(`Response status: ${response.status} for ${context}`);
  
  if (!response.ok) {
    console.error(`Error response from ${context}:`, response);
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`
    }));
    logError(error, context);
    throw new Error(error.message || `API call failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`Response data from ${context}:`, data);
  return data;
};

/**
 * Main function to generate AI response through the backend API
 */
export const generateAIResponse = async (prompt, modelType, messageHistory = []) => {
  try {
    // Consistently use the backend's chat API endpoint
    const url = `${API_BASE_URL}/chat`;
    console.log(`Sending request to: ${url} with model: ${modelType}`);
    console.log('Request payload:', { model: modelType, prompt, messageHistory: messageHistory.length });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelType,
        prompt,
        messageHistory
      }),
    });

    const data = await handleApiResponse(response, `generateAIResponse(${modelType})`);
    return data.text;
  } catch (error) {
    logError(error, `generateAIResponse(${modelType})`);
    throw error;
  }
};

/**
 * Separate function to generate OpenAI response
 */
export const generateOpenAIResponse = async (prompt) => {
  try {
    const url = `${API_BASE_URL}/openai/chat`;
    console.log(`Sending request to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await handleApiResponse(response, 'OpenAI');
    return data.text;
  } catch (error) {
    logError(error, 'OpenAI');
    throw error;
  }
};

/**
 * Separate function to generate Gemini response
 */
export const generateGeminiResponse = async (prompt, messageHistory = []) => {
  try {
    const url = `${API_BASE_URL}/gemini/chat`;
    console.log(`Sending request to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        messageHistory 
      }),
    });

    const data = await handleApiResponse(response, 'Gemini');
    return data.text;
  } catch (error) {
    logError(error, 'Gemini');
    throw error;
  }
};

/**
 * Separate function to generate Perplexity response
 */
export const generatePerplexityResponse = async (prompt) => {
  try {
    const url = `${API_BASE_URL}/perplexity/search`;
    console.log(`Sending request to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: prompt }),
    });

    const data = await handleApiResponse(response, 'Perplexity');
    return data.text;
  } catch (error) {
    logError(error, 'Perplexity');
    // Fallback to generating a local search URL
    try {
      const searchURL = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
      return `Here are the search results from Perplexity AI:
[Click here to view the results](${searchURL})

Would you like me to help you refine your search or find specific resources?`;
    } catch (innerError) {
      logError(innerError, 'Perplexity Fallback');
      throw innerError;
    }
  }
};
