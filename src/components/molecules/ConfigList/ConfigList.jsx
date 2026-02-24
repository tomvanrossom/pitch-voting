import React, { useState } from 'react';
import { Heading } from '../../atoms/Heading/Heading';
import { Button } from '../../atoms/Button/Button';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import './ConfigList.scss';

export function ConfigList({
  title,
  items,
  onAdd,
  onRemove,
  placeholder,
  maxItems,
  minItems,
  singularLabel,
  pluralLabel
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }

    if (trimmed.length > 100) {
      setError('Name is too long (max 100 characters)');
      return;
    }

    if (items.length >= maxItems) {
      setError(`Maximum ${maxItems} ${pluralLabel} allowed`);
      return;
    }

    const normalized = trimmed.toLowerCase();
    const isDuplicate = items.some(item => item.toLowerCase() === normalized);

    if (isDuplicate) {
      setError(`This ${singularLabel} already exists`);
      return;
    }

    setError('');
    setInputValue('');
    onAdd(trimmed);
  };

  return (
    <div className="config-list">
      <Heading level={3}>{title}</Heading>
      <div className="config-list__input-group">
        <input
          type="text"
          className="config-list__input"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button onClick={handleAdd} variant="secondary">
          Add {singularLabel}
        </Button>
      </div>
      {error && (
        <div className="config-list__error" role="alert">
          {error}
        </div>
      )}
      <ChipGroup
        items={items}
        chipProps={{
          onRemove: onRemove,
          color: 'primary',
          size: 'medium'
        }}
      />
    </div>
  );
}
