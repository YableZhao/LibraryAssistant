import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([
    { id: 'default', name: 'New Chat', messages: [] }
  ]);
  const [activeConversation, setActiveConversation] = useState('default');

  const handleNewChat = () => {
    const newId = Date.now().toString();
    setConversations([...conversations, { 
      id: newId, 
      name: 'New Chat', 
      messages: [] 
    }]);
    setActiveConversation(newId);
  };

  const updateConversation = (messages, conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, name: messages[0]?.text.slice(0, 30) || 'New Chat', messages } 
        : conv
    ));
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          + New Chat
        </button>
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${conv.id === activeConversation ? 'active' : ''}`}
              onClick={() => setActiveConversation(conv.id)}
            >
              {conv.name}
            </div>
          ))}
        </div>
      </div>
      <ChatInterface 
        key={activeConversation}
        initialMessages={conversations.find(c => c.id === activeConversation)?.messages || []}
        onUpdateMessages={(messages) => updateConversation(messages, activeConversation)}
      />
    </div>
  );
}

export default App;