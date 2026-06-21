import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import ChatBox from './components/ChatBox';
import './styles/App.css';
import awsConfig from './aws-exports';

Amplify.configure(awsConfig);

function App() {
  return (
    <Authenticator loginMechanisms={['username']}>
      {({ signOut, user }) => (
        <div className="app">
          <div className="app-header">
            <div className="app-logo">Pathology AI Assistant</div>
            <h1 className="app-title">How can we help you today?</h1>
            <p className="app-subtitle">Ask about tests, appointments, preparation, and results</p>
            <button onClick={signOut} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
          <ChatBox />
          <div className="app-footer">
            For general information only · Not medical advice · Powered by AWS Bedrock
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;