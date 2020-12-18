import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors, FieldName, FieldValues } from 'react-hook-form';

interface ValidationErrorProps<T extends FieldValues> {
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
      as={<span role="alert" className="error-message" {...rest} />}
    />
  );
};

export default ValidationError;
