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

  test('shows error for duplicate item (case-insensitive)', async () => {
    render(
      <ConfigList
        title="Voters"
        items={['Alice', 'Bob']}
        onAdd={() => {}}
        onRemove={() => {}}
        placeholder="Enter voter name..."
        maxItems={50}
        minItems={2}
        singularLabel="voter"
        pluralLabel="voters"
      />
    );

    const input = screen.getByPlaceholderText('Enter voter name...');
    await userEvent.type(input, 'alice'); // lowercase

    const button = screen.getByText(/Add voter/i);
    await userEvent.click(button);

    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
  });

  test('shows error for empty string', async () => {
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

    const button = screen.getByText(/Add voter/i);
    await userEvent.click(button);

    expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
  });

  test('trims whitespace from input', async () => {
    const onAdd = vi.fn();

    render(
      <ConfigList
        title="Voters"
        items={[]}
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
    await userEvent.type(input, '  Carol  ');

    const button = screen.getByText(/Add voter/i);
    await userEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith('Carol');
  });

  test('shows error when max items reached', async () => {
    render(
      <ConfigList
        title="Voters"
        items={['A', 'B']}
        onAdd={() => {}}
        onRemove={() => {}}
        placeholder="Enter voter name..."
        maxItems={2}
        minItems={2}
        singularLabel="voter"
        pluralLabel="voters"
      />
    );

    const input = screen.getByPlaceholderText('Enter voter name...');
    await userEvent.type(input, 'C');

    const button = screen.getByText(/Add voter/i);
    await userEvent.click(button);

    expect(screen.getByText(/Maximum 2 voters/i)).toBeInTheDocument();
  });
});
