import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import {
  InputController,
  InputControllerProps,
} from 'components/inputs/InputController';
import { ErrorMessage as Error } from 'components/error/ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { Hint, StyledLabel } from 'styles/StyledForm';

export interface FullInputProps extends InputControllerProps {
  errors: any;
  hintText?: string;
  renderLabel?: (labelText: string, inputId: string) => ReactNode;
  labelText: string;
}

export const FullInput: FunctionComponent<FullInputProps> = ({
  name,
  errors,
  control,
  defaultValue,
  hintText,
  renderLabel = (labelText, inputId) => (
    <StyledLabel htmlFor={inputId}>{labelText}</StyledLabel>
  ),
  labelText,
  inputId,
}: PropsWithChildren<FullInputProps>) => {
  return (
    <>
      {renderLabel(labelText, inputId)}
      <Hint id={`${name}-hint`}>{hintText}</Hint>
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
