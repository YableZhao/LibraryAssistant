/**
 * AI服务层 - 通过后端API调用AI服务
 */

// 获取后端API基础URL
// 获取后端API基础URL，确保路径正确
const getApiBaseUrl = () => {
  // 如果环境变量存在
  if (process.env.REACT_APP_BACKEND_URL) {
    const url = process.env.REACT_APP_BACKEND_URL;
    console.log('Original backend URL:', url);
    // 检查URL是否已经以/api结尾
    if (url.endsWith('/api')) {
      return url;
    } else {
      // 添加/api前缀
      return `${url}/api`;
    }
  }
  // 默认值
  return '/api';
};
const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);

// 日志函数
const logError = (error, context) => {
  console.error(`AI Service Error (${context}):`, error);
};

// 处理API响应的辅助函数
const handleApiResponse = async (response, context) => {
  console.log(`Response status: ${response.status} for ${context}`);
  
  if (!response.ok) {
    console.error(`Error response from ${context}:`, response);
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`
    }));
    logError(error, context);
    throw new Error(error.message || `API调用失败: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`Response data from ${context}:`, data);
  return data;
};

/**
 * 通过后端API生成AI响应的主函数
 */
export const generateAIResponse = async (prompt, modelType, messageHistory = []) => {
  try {
    // 统一使用后端的聊天API端点
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
 * 单独的OpenAI响应生成函数
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
 * 单独的Gemini响应生成函数
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
 * 单独的Perplexity响应生成函数
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
    // fallback到本地搜索URL生成
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


