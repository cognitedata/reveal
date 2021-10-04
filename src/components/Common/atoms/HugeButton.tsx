import styled from 'styled-components';
import { Button, Colors } from '@cognite/cogs.js';

export const HugeButton = styled(Button)`
  color: ${Colors.midblue.hex()};
  background-color: ${Colors['midblue-8'].hex()};
  border: 1px solid ${Colors['midblue-5'].hex()};
  max-width: 320px;
  width: 320px;
  max-height: 120px;
  height: 120px;

  &:hover {
    background-color: ${Colors['midblue-7'].hex()};
  }
`;
