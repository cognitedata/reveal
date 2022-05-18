import styled from 'styled-components/macro';
import { Button, TopBar } from '@cognite/cogs.js';

export const StyledTopBarRight = styled(TopBar.Right)`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

export const StyledTopBar = styled(TopBar)`
  &.cogs-topbar {
    background-color: var(--cogs-bg-inverted);
    border-color: var(--cogs-bg-inverted);
  }
  .cogs-topbar--item__logo,
  .cogs-topbar--item__navigation {
    border-color: var(--cogs-bg-backdrop);
  }

  .cogs-topbar--item :hover,
  & .cogs-topbar--item__actions .actions-item:hover {
    background-color: var(--cogs-bg-backdrop);
  }

  .rc-tabs-tab-disabled .rc-tabs-tab-btn span {
    color: rgba(255, 255, 255, 0.72);
    opacity: 0.4;
  }

  .rc-tabs-tab-disabled .rc-tabs-tab-btn:hover {
    background-color: var(--cogs-bg-inverted) !important;
  }

  .rc-tabs-tab-btn {
    background-color: var(--cogs-bg-inverted);
    color: var(--cogs-text-inverted);
  }

  .rc-tabs-tab-btn:hover {
    background-color: var(--cogs-bg-backdrop);
  }

  .rc-tabs-ink-bar {
    background: var(--cogs-bg-selected);
  }

  h6,
  .cogs-detail {
    color: #fff !important;
  }

  .cogs-icon-Cognite {
    width: 30px !important;
  }

  .cogs-topbar--item__actions {
    border-left: none;
  }
`;

export const StyledButton = styled(Button)`
  color: var(--cogs-white);
  background-color: transparent;
`;
