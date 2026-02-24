import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
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

  test('calls onAdd when adding valid item', async () => {
    const onAdd = vi.fn();

    render(
      <ConfigList
        title="Voters"
        items={['Alice']}
        onAdd={onAdd}
        onRemove={() => {}}
        placeholder="Enter voter name..."
        maxItems={50}
        minItems={2}
        singularLabel="voter"
        pluralLabel="voters"
      />
    );

    const input = screen.getByPlaceholderText('Enter voter name...');
    await userEvent.type(input, 'Bob');

    const button = screen.getByText(/Add voter/i);
    await userEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith('Bob');
  });
});
