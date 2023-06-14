import React, { FunctionComponent } from 'react';
import { DeepMap, FieldError } from 'react-hook-form';
import styled from 'styled-components';
import { InputWithRefProps, InputWithRef } from './InputWithRef';
import ValidationError from '../form/ValidationError';

const InputError = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1rem min-content 1rem;
`;
interface OwnProps extends InputWithRefProps {
  label: string;
  errors: DeepMap<Record<string, any>, FieldError>;
  wrapperId: string;
}

type Props = OwnProps;

export const InputWithError: FunctionComponent<Props> = ({
  label,
  register,
  placeholder,
  defaultValue,
  handleChange,
  hasError,
  errors,
  name,
  wrapperId,
  ...rest
}: OwnProps) => {
  return (
    <InputError id={wrapperId}>
      <label htmlFor={name}>{label}</label>
      <InputWithRef
        register={register}
        handleChange={handleChange}
        name={name}
        hasError={hasError}
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...rest}
      />
      <ValidationError errors={errors} name={name} />
    </InputError>
  );
};
