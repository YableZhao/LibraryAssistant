import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import AdminLayout from './components/Admin/AdminLayout';
import KnowledgeBase from './components/Admin/KnowledgeBase';
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

  // Main chat component with conversations
  const ChatApp = () => (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          <Link to="/admin/knowledge-base" className="admin-link">
            <span className="admin-icon">⚙️</span>
            <span className="admin-text">Knowledge Base</span>
          </Link>
        </div>
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
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/knowledge-base" replace />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;