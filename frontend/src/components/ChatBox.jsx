import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const API_URL = process.env.REACT_APP_API_URL;

const styles = {
  container: {
    width: '100%',
    maxWidth: '760px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    overflow: 'hidden',
  },
  topBar: {
    background: '#003865',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#0066cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  topBarText: {
    flex: 1,
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
  },
  topBarSubtitle: {
    color: '#7eb8f7',
    fontSize: '12px',
  },
  onlineIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    maxHeight: '120px',
    background: '#ffffff',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#003865',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: '18px',
  },
  suggestions: {
    padding: '0 20px 16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  suggestionChip: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #d1d5db',
    background: '#f3f4f6',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }
};

const SUGGESTIONS = [
  'What blood tests are available?',
  'Do I need to fast before my test?',
  'How do I book an appointment?',
  'When will my results be ready?',
  'What is bulk billing?',
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello! I\'m the DHM Healthcare Assistant. I can answer questions about our pathology services, test preparation, appointments, and results. How can I help you today?',
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

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.answer || 'Sorry, I could not get an answer. Please try again.',
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Sorry, I\'m having trouble connecting. Please try again or call DHM on 1800 222 365.',
        sources: [],
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.avatar}>🏥</div>
        <div style={styles.topBarText}>
          <div style={styles.topBarTitle}>DHM Healthcare Assistant</div>
          <div style={styles.topBarSubtitle}>Powered by AWS Bedrock</div>
        </div>
        <div style={styles.onlineIndicator} />
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {showSuggestions && (
        <div style={styles.suggestions}>
          {SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion}
              style={styles.suggestionChip}
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={styles.inputArea}>
        <textarea
          ref={inputRef}
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about our services, tests, appointments..."
          rows={1}
          disabled={loading}
        />
        <button
          style={{
            ...styles.sendButton,
            background: input.trim() && !loading ? '#003865' : '#9ca3af',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
          }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <span style={styles.sendIcon}>➤</span>
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
