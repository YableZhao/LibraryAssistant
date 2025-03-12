import React, { createContext, useContext, useState } from 'react';

// Create context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [conversations, setConversations] = useState([
    { id: 'default', name: 'New Chat', messages: [] }
  ]);
  const [activeConversation, setActiveConversation] = useState('default');
  const [selectedModel, setSelectedModel] = useState('gemini');

  // Handler for creating a new conversation
  const handleNewChat = () => {
    const newId = Date.now().toString();
    setConversations([...conversations, { 
      id: newId, 
      name: 'New Chat', 
      messages: [] 
    }]);
    setActiveConversation(newId);
  };

  // Handler for updating a conversation
  const updateConversation = (messages, conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, name: messages[0]?.text.slice(0, 30) || 'New Chat', messages } 
        : conv
    ));
  };

  // Handler for switching between models
  const handleModelSwitch = (model) => {
    setSelectedModel(model);
  };

  // Values to be provided to consumers
  const contextValue = {
    conversations,
    activeConversation,
    selectedModel,
    handleNewChat,
    setActiveConversation,
    updateConversation,
    handleModelSwitch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Create a custom hook for using this context
export const useAppContext = () => useContext(AppContext);

export default AppContext;
