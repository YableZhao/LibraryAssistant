import React from 'react';

/**
 * Provides UI for switching between different AI models
 */
const ModelSelector = ({ selectedModel, onModelChange }) => {
  return (
    <div className="model-switcher">
      <button 
        className={`model-button ${selectedModel === 'gemini' ? 'active' : ''}`}
        onClick={() => onModelChange('gemini')}
      >
        Gemini (Conversation + References)
      </button>
      <button 
        className={`model-button ${selectedModel === 'openai' ? 'active' : ''}`}
        onClick={() => onModelChange('openai')}
      >
        OpenAI
      </button>
      <button 
        className={`model-button ${selectedModel === 'perplexity' ? 'active' : ''}`}
        onClick={() => onModelChange('perplexity')}
      >
        Perplexity (Search Only)
      </button>
    </div>
  );
};

export default ModelSelector;
