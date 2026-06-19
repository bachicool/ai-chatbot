import React from 'react';
import '../styles/TypingIndicator.css';

function TypingIndicator() {
  return (
    <div className="typing-wrapper">
      <div className="typing-bubble">
        {[0, 200, 400].map(delay => (
          <div
            key={delay}
            className="typing-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default TypingIndicator;