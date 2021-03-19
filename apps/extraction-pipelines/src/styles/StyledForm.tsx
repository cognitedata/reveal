import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import React from 'react';

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
