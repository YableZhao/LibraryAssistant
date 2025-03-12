import React, { useState, useEffect, useRef } from 'react';
import { generateAIResponse } from '../services/aiService';
import './ChatInterface.css';

const CONFIG = {
  app: {
    maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5242880,
    allowedFileTypes: (process.env.REACT_APP_ALLOWED_FILE_TYPES || '').split(',')
  }
};

const ChatInterface = ({ initialMessages = [], onUpdateMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const fileInputRef = useRef(null);

  // 不再直接初始化API客户端，而是使用服务层

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const handleModelSwitch = (model) => {
    setSelectedModel(model);
  };

  const updateMessages = (newMessages) => {
    setMessages(newMessages);
    if (onUpdateMessages) {
      onUpdateMessages(newMessages);
    }
  };

  // isLibraryQuery 函数已移除 - 未使用

  // 使用服务层中的函数，此处不再需要本地实现

  // getPerplexityResearchResults 函数已移除 - 使用服务层来处理

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).filter(file => {
      const isValidType = CONFIG.app.allowedFileTypes.includes(file.type);
      const isValidSize = file.size <= CONFIG.app.maxFileSize;
      
      if (!isValidType) {
        alert(`File type ${file.type} is not supported`);
      }
      if (!isValidSize) {
        alert(`File ${file.name} is too large. Maximum size is ${CONFIG.app.maxFileSize / 1024 / 1024}MB`);
      }
      
      return isValidType && isValidSize;
    });
    
    setSelectedFiles(files);
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));
  };

  // getUTLibrarySearchURL 函数已移除 - 未使用

  const formatMessageWithLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const [, linkText, url] = match;
      const startIndex = match.index;
      if (startIndex > lastIndex) {
        elements.push(text.slice(lastIndex, startIndex));
      }
      elements.push(
        <a 
          key={url + startIndex} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="message-link"
        >
          {linkText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

    const newMessages = [...messages, userMessage];
    updateMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse;

      // 使用服务层的generateAIResponse函数，统一处理不同模型的请求
      aiResponse = await generateAIResponse(input, selectedModel, messages);

      const aiMessage = {
        id: Date.now(),
        text: aiResponse,
        sender: 'ai'
      };

      updateMessages([...newMessages, aiMessage]);

      if (selectedFiles.length > 0) {
        setSelectedFiles([]);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now(),
        text: "Sorry, I'm unable to respond right now. Please try again later.",
        sender: 'ai'
      };
      updateMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>UT Library AI Assistant</h2>
        <div className="model-switcher">
          <button 
            className={`model-button ${selectedModel === 'gemini' ? 'active' : ''}`}
            onClick={() => handleModelSwitch('gemini')}
          >
            Gemini
          </button>
          <button 
            className={`model-button ${selectedModel === 'openai' ? 'active' : ''}`}
            onClick={() => handleModelSwitch('openai')}
          >
            OpenAI
          </button>
          <button 
            className={`model-button ${selectedModel === 'perplexity' ? 'active' : ''}`}
            onClick={() => handleModelSwitch('perplexity')}
          >
            Perplexity
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender}-message`}
          >
            <div className="message-content">
              {formatMessageWithLinks(message.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button 
            type="button" 
            onClick={toggleRecording}
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            disabled={isLoading}
          >
            🎤
          </button>
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="file-button"
            disabled={isLoading}
          >
            📎
          </button>
        </div>
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>

      <div className="file-upload-section">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={CONFIG.app.allowedFileTypes.join(',')}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <div className="selected-files">
          {selectedFiles.map((file, index) => (
            <div key={index} className="selected-file">
              <span>{file.name}</span>
              <button onClick={() => removeFile(file)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
