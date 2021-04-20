import React, { HTMLAttributes } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors, FieldName, FieldValues } from 'react-hook-form';
import { ErrorSpan } from 'styles/StyledForm';

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
      as={<ErrorSpan role="alert" className="error-message" {...rest} />}
    />
  );
};

export default ValidationError;
