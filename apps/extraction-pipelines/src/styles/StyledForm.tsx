import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const CreateFormWrapper = styled.form`
  display: flex;
  flex-direction: column;

  button[type='submit'] {
    align-self: flex-start;
  }
  .input-label {
    font-weight: bold;
  }
  .input-hint {
    font-style: italic;
  }
  .error-message {
    color: ${Colors.danger.hex()};
  }
  .cogs-input {
    margin-bottom: 1rem;
  }
`;
