import React, { FunctionComponent, PropsWithChildren } from 'react';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import {
  InputController,
  InputControllerProps,
} from 'components/inputs/InputController';
import { ErrorMessage as Error } from 'components/error/ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';

export interface FullInputProps extends InputControllerProps {
  errors: any;
  hintText: string;
  labelText: string;
}

export const FullInput: FunctionComponent<FullInputProps> = ({
  name,
  errors,
  control,
  defaultValue,
  hintText,
  labelText,
  inputId,
}: PropsWithChildren<FullInputProps>) => {
  return (
    <>
      <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
      <span id={`${name}-hint`} className="input-hint">
        {hintText}
      </span>
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => <Error id={`${name}-error`}>{message}</Error>}
      />
      <InputController
        name={name}
        inputId={inputId}
        control={control}
        defaultValue={defaultValue}
        aria-invalid={!!errors[name]}
        aria-describedby={`${name}-hint ${name}-error`}
      />
    </>
  );
};
