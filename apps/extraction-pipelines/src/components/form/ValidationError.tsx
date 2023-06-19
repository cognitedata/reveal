import React, { HTMLAttributes } from 'react';
import { FieldErrors, FieldName, FieldValues } from 'react-hook-form';

import { ErrorMessage } from '@hookform/error-message';

import { ErrorSpan } from '../styled';

export interface ValidationErrorProps<T extends FieldValues>
  extends HTMLAttributes<HTMLSpanElement> {
  errors: FieldErrors<T>;
  name: FieldName<T>;
}

const ValidationError = ({
  name,
  errors,
  ...rest
}: ValidationErrorProps<FieldValues>) => {
  return (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => {
        return (
          <ErrorSpan role="alert" className="error-message" {...rest}>
            {message}
          </ErrorSpan>
        );
      }}
    />
  );
};

export default ValidationError;
