import React, { FunctionComponent } from 'react';
import { DeepMap, FieldError } from 'react-hook-form';
import styled from 'styled-components';
import { InputWithRefProps, InputWithRef } from './InputWithRef';
import ValidationError from '../form/ValidationError';

const InputError = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1rem;
  align-self: flex-end;
`;
interface OwnProps extends InputWithRefProps {
  errors: DeepMap<Record<string, any>, FieldError>;
}

type Props = OwnProps;

export const InputWithError: FunctionComponent<Props> = ({
  register,
  placeholder,
  defaultValue,
  handleChange,
  errors,
  name,
  ...rest
}: OwnProps) => {
  return (
    <InputError>
      <InputWithRef
        register={register}
        handleChange={handleChange}
        name={name}
        error={errors[name]}
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...rest}
      />
      <ValidationError errors={errors} name={name} />
    </InputError>
  );
};
