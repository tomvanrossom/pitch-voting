import React from 'react';
import './Chip.scss';

export function Chip({ label, color = 'primary', variant = 'filled', size = 'medium', onRemove }) {
  const classes = [
    'chip',
    `chip--${color}`,
    variant === 'outlined' && 'chip--outlined',
    size === 'small' && 'chip--small',
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {label}
      {onRemove && (
        <button
          className="chip__remove"
          onClick={() => onRemove(label)}
          aria-label={`Remove ${label}`}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
}
