import styled from 'styled-components/macro';
import { Button, TopBar } from '@cognite/cogs.js';

export const StyledTopBarRight = styled(TopBar.Right)`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

export const StyledTopBarLeft = styled(TopBar.Left)`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

export const StyledTopBar = styled(TopBar)`
  background-color: var(--cogs-bg-accent);
`;

export const StyledButton = styled(Button)`
  && {
    background: transparent;
  }
`;

export const StyledTitleButton = styled(Button)`
  && {
    background: transparent;
    margin-left: 4px;
    padding: 8px 16px !important;

    .cogs-icon {
      margin-right: 18px;
    }
  }
`;
