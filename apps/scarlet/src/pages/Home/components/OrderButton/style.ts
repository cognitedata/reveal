import styled from 'styled-components';
import { Button as CogsButton } from '@cognite/cogs.js';

export const Button = styled(CogsButton)`
  display: flex;
  align-items: center;
  font-weight: 400;
  color: inherit;

  > .cogs-icon {
    color: #3f5efb;
  }
`;
