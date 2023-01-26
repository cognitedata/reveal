import styled from 'styled-components';
import { Button } from '@cognite/cogs.js-v9';

export const StyledButton = styled(Button)`
  margin-left: 16px;

  &.cogs.cogs-button:hover {
    background: #f2f2f5;
  }
`;
