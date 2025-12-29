import React from 'react';
import { Chip } from '../../atoms/Chip/Chip';
import './ChipGroup.scss';

export function ChipGroup({ 
  items = [], 
  chipProps = {},
  className = '',
  ...props 
}) {
  const classes = ['chip-group', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {items.map((item, idx) => (
        <Chip 
          key={typeof item === 'string' ? item : idx} 
          label={typeof item === 'string' ? item : item.label}
          {...chipProps}
          {...(typeof item === 'object' ? item : {})}
        />
      ))}
    </div>
  );
}
