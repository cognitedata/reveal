import styled from 'styled-components';
import React from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { PaddedGridForm } from 'styles/grid/StyledGrid';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputWidth?: number;
}
export const CreateFormWrapper = styled.form`
  display: flex;
  flex-direction: column;

  .input-label {
    font-weight: bold;
  }
  .input-hint {
    font-style: italic;
    margin-bottom: 0.5rem;
  }
  .error-message {
    color: ${Colors.danger.hex()};
  }
  .cogs-input,
  .cogs-checkbox {
    width: ${(props: InputProps) =>
      props.inputWidth ? `${props.inputWidth}%` : '100%'};
    margin-bottom: 1rem;
    &[aria-invalid='true'] {
      border-color: ${Colors.danger.hex()};
    }
    &:focus {
      outline: -webkit-focus-ring-color auto 0.0625rem;
      outline-offset: 0.0625rem;
    }
  }
  button {
    grid-area: btn;
  }
`;
export const StyledTextArea = styled.textarea`
  width: 100%;
  height: 10rem;
`;

export const EditButton = styled((props) => (
  <Button type="ghost" icon="Edit" iconPlacement="right" {...props}>
    {props.children}
  </Button>
))`
  justify-content: space-between;
`;
export const StyledForm = styled((props) => (
  <PaddedGridForm {...props}>{props.children}</PaddedGridForm>
))`
  grid-template-columns: 8rem 3fr 3rem 3rem;
  height: 4rem;
  overflow: hidden;
  transition: height 0.66s ease-out;
  &.expands {
    height: 15rem;
  }
  &.expands-large {
    height: max-content;
  }
`;
export const StyledRadioGroup = styled.fieldset`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  legend {
    font-weight: bold;
    font-size: initial;
    margin-bottom: 0;
  }
`;
