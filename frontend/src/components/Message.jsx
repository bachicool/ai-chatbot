import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  assistantWrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    background: '#003865',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  assistantBubble: {
    background: '#f3f4f6',
    color: '#111827',
    borderBottomLeftRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  errorBubble: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  timestamp: {
    fontSize: '11px',
    color: '#9ca3af',
    padding: '0 4px',
  },
  sources: {
    maxWidth: '75%',
    padding: '6px 12px',
    background: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  sourcesTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sourceItem: {
    fontSize: '11px',
    color: '#3b82f6',
    wordBreak: 'break-all',
  },
  roleLabel: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '600',
    padding: '0 4px',
  }
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSource(uri) {
  const parts = uri.split('/');
  return parts[parts.length - 1].replace('.md', '').replace(/-/g, ' ');
}

function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      ...styles.wrapper,
      ...(isUser ? styles.userWrapper : styles.assistantWrapper)
    }}>
      {!isUser && (
        <span style={styles.roleLabel}>DHM Assistant</span>
      )}

      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.userBubble : styles.assistantBubble),
        ...(message.isError ? styles.errorBubble : {}),
      }}>
        {message.text}
      </div>

      {/* Sources */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <div style={styles.sources}>
          <div style={styles.sourcesTitle}>📄 Sources</div>
          {message.sources.map((source, i) => (
            <div key={i} style={styles.sourceItem}>
              {formatSource(source)}
            </div>
          ))}
        </div>
      )}

      <span style={styles.timestamp}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

export default Message;
