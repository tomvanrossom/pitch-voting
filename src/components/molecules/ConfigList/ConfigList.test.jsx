import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigList } from './ConfigList';

describe('ConfigList', () => {
  test('renders title and input field', () => {
    render(
      <ConfigList
        title="Voters"
        items={[]}
        onAdd={() => {}}
        onRemove={() => {}}
        placeholder="Enter voter name..."
        maxItems={50}
        minItems={2}
        singularLabel="voter"
        pluralLabel="voters"
      />
    );

    expect(screen.getByText('Voters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter voter name...')).toBeInTheDocument();
  });
});
