import React from 'react';
import './Card.scss';

export function Card({ 
  children, 
  padding = 'medium',
  shadow = true,
  className = '',
  ...props 
}) {
  const classes = [
    'card',
    `card--padding-${padding}`,
    shadow && 'card--shadow',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
