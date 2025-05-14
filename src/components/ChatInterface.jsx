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

  // No longer directly initialize API client, use service layer instead

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

  // isLibraryQuery function removed - unused

  // Use functions from the service layer, local implementation no longer needed here

  // getPerplexityResearchResults function removed - use service layer to handle

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

  // getUTLibrarySearchURL function removed - unused

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

      // Use the generateAIResponse function from the service layer to handle requests for different models uniformly
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
            placeholder="Ask the UT Library Assistant..."
            disabled={isLoading}
          />
          <div className="input-buttons">
            <button 
              type="button" 
              onClick={toggleRecording}
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              disabled={isLoading}
              aria-label="Record voice input"
              title="Record voice input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 8z"/>
              </svg>
            </button>
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="file-button"
              disabled={isLoading}
              aria-label="Attach files"
              title="Attach files"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"/>
              </svg>
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="send-button"
              aria-label="Send message"
              title="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
              </svg>
            </button>
          </div>
        </div>
      </form>

      {selectedFiles.length > 0 && (
        <div className="file-upload-section show">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                <span>{file.name}</span>
                <button onClick={() => removeFile(file)} className="remove-file-btn" aria-label="Remove file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
