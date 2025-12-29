import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.scss';
import App from './pages/App.jsx';
import { VotingProvider } from './context/votingContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VotingProvider>
      <App />
    </VotingProvider>
  </React.StrictMode>
);
