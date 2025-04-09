import React, { useState } from 'react';
import './MessageList.css';

/**
 * Displays chat messages with support for formatted text, links and RAG sources
 */
const MessageList = ({ messages, isLoading }) => {
  const formatMessageWithLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, url] = match;
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

    // Now split lines and wrap them in <p> tags
    const finalElements = [];
    let lineBuffer = [];
    for (const part of elements) {
      if (typeof part === 'string') {
        const lines = part.split('\n');
        for (let i = 0; i < lines.length; i++) {
          lineBuffer.push(lines[i]);
          if (i < lines.length - 1) {
            finalElements.push(<p key={`p-${i}`}>{lineBuffer}</p>);
            lineBuffer = [];
          }
        }
      } else {
        // part is a link element
        lineBuffer.push(part);
      }
    }
    if (lineBuffer.length > 0) {
      finalElements.push(<p key="final-p">{lineBuffer}</p>);
    }

    return finalElements;
  };

  // State to track which messages have expanded sources
  const [expandedSources, setExpandedSources] = useState({});

  // Toggle expanded sources for a message
  const toggleSources = (messageId) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Render sources if they exist
  const renderSources = (message) => {
    if (!message.sources || message.sources.length === 0) return null;
    
    const isExpanded = expandedSources[message.id];
    
    return (
      <div className="message-sources">
        <button 
          className="sources-toggle"
          onClick={() => toggleSources(message.id)}
        >
          {isExpanded ? 'Hide Sources' : `Show Sources (${message.sources.length})`}
        </button>
        
        {isExpanded && (
          <div className="sources-list">
            {message.sources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-header">
                  <span className="source-number">[{source.id}]</span>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                    {source.title || source.url}
                  </a>
                </div>
                {source.snippet && (
                  <div className="source-snippet">{source.snippet}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.sender}-message`}
        >
          <div className="message-content">
            {formatMessageWithLinks(message.text)}
            {message.sender === 'ai' && renderSources(message)}
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
  );
};

export default MessageList;
