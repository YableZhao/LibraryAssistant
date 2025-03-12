import React, { useState, useEffect, useRef } from 'react';

/**
 * Handles text input, voice recording, and message submission
 */
const MessageInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
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
      </div>
      <button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="send-button"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
