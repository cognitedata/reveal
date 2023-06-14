import React, { FC } from 'react';
import { Ref } from 'react-hook-form/dist/types/fields';
import { DeepMap, FieldError } from 'react-hook-form';

export interface InputWithRefProps {
  name: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  register: (ref: Ref | null) => void;
  placeholder: string;
  defaultValue: string | undefined;
  hasError?: boolean;
}
export interface InputWithRefError {
  error: DeepMap<Record<string, any>, FieldError>;
}

export const InputWithRef: FC<InputWithRefProps> = ({
  handleChange,
  name,
  register,
  placeholder,
  defaultValue,
  hasError = false,
  ...rest
}: InputWithRefProps) => {
  return (
    <input
      type="text"
      onChange={handleChange}
      id={name}
      name={name}
      placeholder={placeholder}
      className={`cogs-input full-width ${hasError && 'has-error'}`}
      ref={register}
      defaultValue={defaultValue}
      {...rest}
    />
  );
};
