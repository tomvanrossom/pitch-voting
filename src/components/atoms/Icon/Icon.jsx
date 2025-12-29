import React from 'react';
import './Icon.scss';

export function Icon({ 
  emoji, 
  size = 'medium', 
  label,
  className = '',
  ...props 
}) {
  const classes = ['icon', `icon--${size}`, className].filter(Boolean).join(' ');
  
  return (
    <span 
      className={classes} 
      role="img" 
      aria-label={label || emoji}
      {...props}
    >
      {emoji}
    </span>
  );
}
