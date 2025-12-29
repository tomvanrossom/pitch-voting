import React from 'react';
import './Heading.scss';

export function Heading({ 
  level = 2, 
  size, 
  className = '', 
  children, 
  ...props 
}) {
  const Tag = `h${level}`;
  const sizeClass = size ? `heading--${size}` : `heading--h${level}`;
  const classes = ['heading', sizeClass, className].filter(Boolean).join(' ');
  
  return <Tag className={classes} {...props}>{children}</Tag>;
}
