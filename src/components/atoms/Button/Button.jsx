import React from 'react';
import './Button.scss';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  ...props 
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
