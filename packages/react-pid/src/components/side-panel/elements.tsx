import { Input } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledInput = styled(Input)`
  .input-wrapper {
    flex: 1;
  }
  .cogs-input {
    width: 100%;
  }
`;

export const Pre = styled.pre`
  font-size: 0.75rem;
`;
