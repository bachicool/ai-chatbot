import React from 'react';
import '../styles/Message.css';

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSource(uri) {
  const parts = uri.split('/');
  return parts[parts.length - 1]
    .replace('.md', '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ');
}

function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
        {message.text}
      </div>

      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="message-sources">
          <div className="message-sources-title">Sources</div>
          {message.sources.map((source, i) => (
            <div key={i} className="message-source-item">
              📄 {formatSource(source)}
            </div>
          ))}
        </div>
      )}

      <span className="message-timestamp">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

export default Message;