import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '600',
    padding: '0 4px',
  },
  bubble: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    padding: '14px 18px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#9ca3af',
    animation: 'bounce 1.2s infinite',
  },
};

const keyframes = `
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
`;

function TypingIndicator() {
  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.wrapper}>
        <span style={styles.label}>DHM Assistant</span>
        <div style={styles.bubble}>
          <div style={{ ...styles.dot, animationDelay: '0ms' }} />
          <div style={{ ...styles.dot, animationDelay: '200ms' }} />
          <div style={{ ...styles.dot, animationDelay: '400ms' }} />
        </div>
      </div>
    </>
  );
}

export default TypingIndicator;
