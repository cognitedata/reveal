import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors, FieldName, FieldValues } from 'react-hook-form';

interface ValidationErrorProps<T extends FieldValues> {
  errors: FieldErrors<T>;
  name: FieldName<T>;
  // eslint-disable-next-line
  className?: string;
}

const ValidationError = ({
  name,
  errors,
  className,
  ...rest
}: ValidationErrorProps<FieldValues>) => {
  return (
    <ErrorMessage
      errors={errors}
      name={name}
      as={<span role="alert" className={className} {...rest} />}
    />
  );
};

export default ValidationError;
