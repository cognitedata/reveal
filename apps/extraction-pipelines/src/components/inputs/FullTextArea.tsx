import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { StyledTextArea } from 'pages/create/DocumentationPage';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { FullInputProps } from 'components/inputs/FullInput';
import { ErrorMessage as Error } from 'components/error/ErrorMessage';
import { Hint } from 'styles/StyledForm';

export const FullTextArea: FunctionComponent<FullInputProps> = ({
  name,
  labelText,
  inputId,
  hintText,
  control,
  errors,
  defaultValue,
}: PropsWithChildren<FullInputProps>) => {
  return (
    <>
      <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
      <Hint id={`${name}-hint`}>{hintText}</Hint>
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => <Error id={`${name}-error`}>{message}</Error>}
      />
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ onChange, value }: ControllerRenderProps) => (
          <StyledTextArea
            id={inputId}
            cols={30}
            rows={10}
            value={value}
            onChange={onChange}
            className="cogs-input"
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-hint ${name}-error`}
          />
        )}
      />
    </>
  );
};
