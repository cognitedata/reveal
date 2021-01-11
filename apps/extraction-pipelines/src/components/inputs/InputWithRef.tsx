import React, { FC } from 'react';
import { Ref } from 'react-hook-form/dist/types/fields';
import { DeepMap, FieldError } from 'react-hook-form';
import { IntegrationFieldName } from '../../model/Integration';
import { User } from '../../model/User';

export interface InputWithRefProps {
  name: IntegrationFieldName | keyof User;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  register: (ref: Ref | null) => void;
  placeholder: string;
  defaultValue: string | undefined;
}
export interface InputWithRefError {
  error: DeepMap<Record<string, any>, FieldError>;
}
type InputProps = InputWithRefProps & InputWithRefError;

export const InputWithRef: FC<InputProps> = ({
  handleChange,
  name,
  register,
  placeholder,
  defaultValue,
  error,
  ...rest
}: InputProps) => {
  return (
    <input
      type="text"
      onChange={handleChange}
      id={name}
      name={name}
      placeholder={placeholder}
      className={`cogs-input full-width ${error && 'has-error'}`}
      ref={register}
      defaultValue={defaultValue}
      {...rest}
    />
  );
};
