import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

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
  .cogs-input {
    margin-bottom: 1rem;
  }
  button {
    grid-area: btn;
    justify-self: start;
    width: fit-content;
  }
`;
