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
        <Button onClick={() => {}} variant="secondary">
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
