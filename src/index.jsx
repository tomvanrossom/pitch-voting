import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './styles/global.scss';
import App from './pages/App.jsx';
import { VotingProvider } from './context/votingContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <VotingProvider>
        <App />
      </VotingProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
