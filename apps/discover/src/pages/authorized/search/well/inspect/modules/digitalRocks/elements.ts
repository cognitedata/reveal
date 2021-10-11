import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

export const TableButton = styled(Button)`
  position: absolute;
  margin-top: -18px;
  right: 0;
`;

export const DigitalRocksSampleWrapper = styled.div`
  > * tbody > tr {
    border-bottom-style: dashed;
  }
`;
