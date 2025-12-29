import React from 'react';
import { Label } from '../../atoms/Label/Label';
import './FormField.scss';

export function FormField({ 
  label, 
  error, 
  required = false,
  children,
  id,
  ...props 
}) {
  const errorId = error ? `${id}-error` : undefined;
  
  return (
    <div className="form-field" {...props}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <div className="form-field__input">
        {React.cloneElement(children, {
          id,
          'aria-describedby': errorId,
          'aria-invalid': error ? 'true' : 'false',
        })}
      </div>
      {error && (
        <div 
          className="form-field__error"
          role="alert"
          id={errorId}
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
}
