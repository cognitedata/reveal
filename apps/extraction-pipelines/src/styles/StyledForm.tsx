import styled from 'styled-components';
import React from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { PaddedGridForm } from 'styles/grid/StyledGrid';
import { bottomSpacing } from 'styles/StyledVariables';

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

export const StyledLabel = styled.label`
  font-weight: bold;
`;
export const Hint = styled.span`
  color: ${Colors['greyscale-grey6'].hex()};
  margin-bottom: ${bottomSpacing};
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  height: 10rem;
  padding-top: 0.5rem;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;

export const EditButton = styled((props) => (
  <Button
    type="ghost"
    icon="Edit"
    iconPlacement="right"
    className="edit-button"
    {...props}
  >
    {props.children}
  </Button>
))`
  display: grid;
  grid-template-columns: 1fr 3rem;
  text-align: left;
  grid-column-gap: 1rem;
  height: fit-content;
`;

export const SwitchButton = styled.button`
  width: 6rem;
  background: white;
  border: 0.125rem solid ${Colors.primary.hex()};
  border-radius: 0.2rem;
  padding: 0.2rem;
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
  .on,
  .off {
    margin: 1rem 0.3rem;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
  &[role='switch'][aria-checked='true'] {
    .on {
      background: ${Colors.primary.hex()};
      color: white;
    }
    .off {
      background: white;
      color: ${Colors.primary.hex()};
    }
  }
  &[role='switch'][aria-checked='false'] {
    .on {
      background: white;
      color: ${Colors.primary.hex()};
    }
    .off {
      background: ${Colors.primary.hex()};
      color: white;
    }
  }
`;

export const ErrorSpan = styled.span`
  color: ${Colors.danger.hex()};
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
