/* eslint-disable @cognite/no-number-z-index */
import styled from 'styled-components/macro';

export const InputWrapper = styled.div`
  input,
  .input-wrapper {
    width: 100%;
  }

  .cogs-icon {
    margin-left: -6px;
  }

  input[type='datetime-local']::-webkit-datetime-edit {
    color: var(--cogs-text-icon--strong);
    margin-left: -8px;
  }

  input[type='datetime-local']::-webkit-calendar-picker-indicator {
    background: transparent;
    color: transparent;
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 0;
    bottom: 0;
    left: 8px;
    z-index: 1;
  }
`;
