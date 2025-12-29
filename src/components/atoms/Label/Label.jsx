import React from 'react';
import './Label.scss';

export function Label({ children, required = false, ...props }) {
  return (
    <label className="label" {...props}>
      {children}
      {required && <span className="label__required" aria-label="required">*</span>}
    </label>
  );
}
