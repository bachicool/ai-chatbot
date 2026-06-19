import React from 'react';
import ChatBox from './components/ChatBox';

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #003865 0%, #0066cc 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#ffffff',
  },
  logo: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#7eb8f7',
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#a8c8f0',
  },
  footer: {
    marginTop: '20px',
    color: '#7eb8f7',
    fontSize: '12px',
    textAlign: 'center',
  }
};

function App() {
  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logo}>Sonic Healthcare · DHM Pathology</div>
        <h1 style={styles.title}>Healthcare AI Assistant</h1>
        <p style={styles.subtitle}>Ask me anything about our pathology and healthcare services</p>
      </div>
      <ChatBox />
      <div style={styles.footer}>
        Powered by AWS Bedrock · For general information only · Not medical advice
      </div>
    </div>
  );
}

export default App;
