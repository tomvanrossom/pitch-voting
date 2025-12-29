import React from 'react';
import './Alert.scss';

export function Alert({ 
  children, 
  variant = 'info',
  className = '',
  ...props 
}) {
  const classes = ['alert', `alert--${variant}`, className].filter(Boolean).join(' ');

  return (
    <output className={classes} aria-live="polite" {...props}>
      {children}
    </output>
  );
}
