import React from 'react';
import './Select.scss';

export function Select({ 
  options = [], 
  error = false, 
  placeholder = 'Select...',
  ...props 
}) {
  const classes = [
    'select',
    error && 'select--error',
  ].filter(Boolean).join(' ');

  return (
    <select className={classes} {...props}>
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
