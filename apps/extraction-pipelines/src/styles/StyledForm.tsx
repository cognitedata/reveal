import styled from 'styled-components';
import React from 'react';
import { Button, Colors, Input } from '@cognite/cogs.js';
import { PaddedGridForm } from 'styles/grid/StyledGrid';
import { hintBottomSpacing } from 'styles/StyledVariables';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputWidth?: number;
}
export const CreateFormWrapper = styled.form`
  display: flex;
  flex-direction: column;

  .error-message {
    color: ${Colors.danger.hex()};
  }
  .cogs-input,
  .cogs-checkbox {
    width: ${(props: InputProps) =>
      props.inputWidth ? `${props.inputWidth}%` : '100%'};
    &[aria-invalid='true'] {
      border-color: ${Colors.danger.hex()};
    }
    &:focus {
      outline: -webkit-focus-ring-color auto 0.0625rem;
      outline-offset: 0.0625rem;
    }
  }

  button,
  a.cogs-btn.cogs-btn-secondary,
  textarea,
  .cogs-input,
  .cogs-select,
  .cogs-checkbox,
  .bottom-spacing {
    margin-bottom: 2rem;
  }
  > input.cogs-input,
  .cogs-select,
  .rc-collapse-content-box > .cogs-input,
  #cron-input {
    width: 50%;
  }
  #documentation-input {
    width: 100%;
    margin-bottom: 0;
  }
`;

export const StyledLabel = styled.label`
  font-weight: bold;
`;

export const Hint = styled.span`
  font-style: italic;
  color: ${Colors['greyscale-grey6'].hex()};
  margin-bottom: ${hintBottomSpacing};
`;

export const StyledInput = styled(Input)`
  &.cogs-input,
  .cogs-input-default {
    margin: 0.125rem;
  }
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
  width: ${(props: { width?: string }) => props.width || 'auto'}; ;
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
  padding: 1rem;
  &.expands {
    height: 15rem;
  }
  &.expands-large {
    height: max-content;
  }
`;
export const ColumnForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props: { mb?: boolean }) => (props.mb ? '1rem' : '0')};
  label {
    margin-left: 1rem;
  }
`;
