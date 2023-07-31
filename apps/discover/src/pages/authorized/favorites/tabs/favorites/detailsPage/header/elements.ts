import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { FlexRow } from 'styles/layout';

export const ToggleContainer = styled.div`
  margin-right: 38px;

  & .cogs-switch {
    align-items: center;
    flex-direction: row-reverse;
  }

  & .switch-ui {
    margin-right: 0;
  }
`;

export const ToggleLabel = styled.div`
  font-size: 12px;
  white-space: nowrap;
`;

export const ActionContainer = styled(FlexRow)`
  align-items: center;
`;

export const ButtonWithMargin = styled(Button)`
  margin-left: 12px;
`;
