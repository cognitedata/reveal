import styled from 'styled-components';
import React from 'react';
import { Colors, Input } from '@cognite/cogs.js';
import { PaddedGridForm } from 'styles/grid/StyledGrid';
import { hintBottomSpacing, sideBarLabelColor } from 'styles/StyledVariables';

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
      box-shadow: none;
    }
  }

  > input.cogs-input,
  .cogs-select,
  .rc-collapse-content-box > .cogs-input,
  #cron-input {
    width: 100%;
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
  color: ${Colors['greyscale-grey6'].hex()};
  margin-bottom: ${hintBottomSpacing};
  display: block;
`;

export const StyledInput = styled(Input)`
  &.cogs-input,
  .cogs-input-default {
    margin: 0.125rem;
  }
`;
export const StyledTextArea = styled.textarea`
  width: 100%;
  height: inherit;
  padding-top: 0.5rem;
  &.has-error {
    border-color: ${Colors.danger.hex()};
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
  margin-bottom: ${(props: { marginBottom?: boolean }) =>
    props.marginBottom ? '1rem' : '0'};
  label {
    margin-left: 1rem;
    color: ${sideBarLabelColor};
  }
`;

export const AddForm = styled.form`
  display: grid;
  grid-column-gap: 0.5rem;
  align-items: center;
  grid-template-rows: max-content;
  input {
    width: 100%;
  }
  button {
    justify-self: end;
  }
  [aria-expanded] {
    justify-self: end;
  }
`;
