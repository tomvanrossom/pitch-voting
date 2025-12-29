import React from 'react';
import { Chip } from '../../atoms/Chip/Chip';
import './StepperItem.scss';

export function StepperItem({ 
  number, 
  label, 
  active = false, 
  completed = false,
  eliminatedCandidate,
}) {
  const classes = [
    'stepper-item',
    active && 'stepper-item--active',
    completed && 'stepper-item--completed',
  ].filter(Boolean).join(' ');

  return (
    <li className={classes} aria-current={active ? 'step' : undefined}>
      <span className="stepper-item__circle">{number}</span>
      <span className="stepper-item__label">
        {label}
        {eliminatedCandidate && (
          <span className="stepper-item__chip">
            <Chip
              label={`✗ ${eliminatedCandidate}`}
              size="small"
              color="error"
            />
          </span>
        )}
      </span>
    </li>
  );
}
