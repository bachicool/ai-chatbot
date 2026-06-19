import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import '../styles/ChatBox.css';

const API_URL = process.env.REACT_APP_API_URL;

const SUGGESTIONS = [
  'What blood tests are available?',
  'Do I need to fast before my test?',
  'How do I book an appointment?',
  'When will my results be ready?',
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Hello! I'm your Pathology AI Assistant. I can answer questions about pathology services, test preparation, appointments, and results. How can I help you today?",
  sources: [],
  timestamp: new Date(),
};

function ChatBox() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const text = question || input.trim();
    if (!text || loading) return;

    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.answer || 'Sorry, I could not get an answer. Please try again.',
        sources: data.sources || [],
        timestamp: new Date(),
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting. Please try again shortly.",
        sources: [],
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim() && !loading;

  return (
    <div className="chatbox-container">
      <div className="chatbox-topbar">
        <div className="chatbox-avatar">🔬</div>
        <div className="chatbox-topbar-text">
          <div className="chatbox-topbar-title">Pathology Assistant</div>
          <div className="chatbox-topbar-subtitle">Ask about services, tests & appointments</div>
        </div>
        <div className="chatbox-online">
          <div className="chatbox-online-dot" />
          <span className="chatbox-online-text">Online</span>
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="chatbox-suggestions">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => sendMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chatbox-input-area">
        <textarea
          ref={inputRef}
          className="chatbox-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          rows={1}
          disabled={loading}
        />
        <button
          className={`chatbox-send-btn ${canSend ? 'active' : 'inactive'}`}
          onClick={() => sendMessage()}
          disabled={!canSend}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBox;