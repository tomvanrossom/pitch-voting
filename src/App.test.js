import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import { VotingProvider } from './votingContext.jsx';

test('renders voting app title', () => {
  render(
    <VotingProvider>
      <App />
    </VotingProvider>
  );
  const titleElement = screen.getByRole('heading', { name: /2025 Pitch Voting/i });
  expect(titleElement).toBeInTheDocument();
});
