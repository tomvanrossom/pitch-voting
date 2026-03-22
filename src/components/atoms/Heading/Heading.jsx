import React, { forwardRef } from 'react';
import './Heading.scss';

export const Heading = forwardRef(function Heading({
  level = 2,
  size,
  className = '',
  children,
  ...props
}, ref) {
  const Tag = `h${level}`;
  const sizeClass = size ? `heading--${size}` : `heading--h${level}`;
  const classes = ['heading', sizeClass, className].filter(Boolean).join(' ');

  return <Tag ref={ref} className={classes} {...props}>{children}</Tag>;
});
