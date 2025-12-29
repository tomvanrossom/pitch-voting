import React from 'react';
import './Chip.scss';

export function Chip({ label, color = 'primary', variant = 'filled', size = 'medium' }) {
  const classes = [
    'chip',
    `chip--${color}`,
    variant === 'outlined' && 'chip--outlined',
    size === 'small' && 'chip--small',
  ].filter(Boolean).join(' ');

  return <span className={classes}>{label}</span>;
}
