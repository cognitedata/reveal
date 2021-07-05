import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { Controller } from 'react-hook-form';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { FullInputProps } from 'components/inputs/FullInput';
import { ErrorMessage as Error } from 'components/error/ErrorMessage';
import { Hint } from 'styles/StyledForm';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

const StyledTextArea = styled.textarea`
  height: 10rem;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey3'].hex()};
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  :before {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: black;
  }
`;
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
        render={({ field, fieldState }) => (
          <StyledTextArea
            id={inputId}
            cols={30}
            rows={10}
            value={field.value}
            onChange={field.onChange}
            className="cogs-input full-width"
            aria-invalid={!!fieldState.error}
            aria-describedby={`${name}-hint ${name}-error`}
          />
        )}
      />
    </>
  );
};
