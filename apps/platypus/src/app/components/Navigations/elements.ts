import styled from 'styled-components/macro';
import { Button, TopBar, Body, Flex } from '@cognite/cogs.js';

export const StyledTopBarRight = styled(TopBar.Right)`
  display: flex;
  align-items: center;
  padding-right: 12px;
`;

export const StyledTopBarLeft = styled(TopBar.Left)`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

export const StyledTopBar = styled(TopBar)`
  && {
    height: 44px;
  }
  background-color: var(--cogs-bg-accent);
`;

export const StyledButton = styled(Button)`
  && {
    background: transparent;
  }
`;

export const StyledTitleButton = styled(Button)`
  && {
    width: 36px;
    height: 36px;
    padding: 10px !important;
  }
`;

export const StyledTitle = styled(Body)`
  && {
    padding-left: 10px;
    color: rgba(0, 0, 0, 0.7);
  }
`;

export const StyledFlex = styled(Flex)`
  padding: 10px;
`;
