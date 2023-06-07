import { Button, Flex, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledMenu = styled(Menu)`
  align-items: flex-start;
`;

export const HorizontalDivider = styled(Flex)`
  border-top: 1px solid var(--cogs-greyscale-grey4);
  width: 100%;
  height: 3px;
`;

export const StyledMenuButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`;

export const StyledMenuButtonDelete = styled(StyledMenuButton)`
  color: var(--cogs-midorange-1);
  padding-left: 24px !important;
`;

export const StyledMenuDuplicate = styled(StyledMenuButton)`
  padding-left: 24px !important;
`;

export const PopupText = styled.span`
  margin: 0.5em 1em;
`;

export const PopupContainer = styled.div`
  width: 100%;

  .tippy-content {
    margin: 10px;
  }
  .cogs-popconfirm--actions {
    padding-bottom: 10px !important;
  }
`;
