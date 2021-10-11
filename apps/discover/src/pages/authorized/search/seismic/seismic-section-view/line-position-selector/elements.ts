import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

export const LinePositionSelectorWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  & > .cogs-input {
    padding: 4px;
    width: 75px;
    margin-right: 5px;
  }
`;

export const BoldLabel = styled.span`
  font-weight: 700;
  padding-right: 8px;
`;

export const IncrementValue = styled.span`
  padding: 0 5px;
`;

export const IncrementButton = styled(Button)`
  height: auto !important;
`;
