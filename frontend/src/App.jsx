import React from 'react';
import ChatBox from './components/ChatBox';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <div className="app-header">
        <div className="app-logo">Pathology AI Assistant</div>
        <h1 className="app-title">How can we help you today?</h1>
        <p className="app-subtitle">Ask about tests, appointments, preparation, and results</p>
      </div>
      <ChatBox />
      <div className="app-footer">
        For general information only · Not medical advice · Powered by AWS Bedrock
      </div>
    </div>
  );
}

export default App;