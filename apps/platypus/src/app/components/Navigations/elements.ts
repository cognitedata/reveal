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
  }

  .cogs-topbar--item :hover {
    background-color: var(--cogs-bg-inverted) !important;
  }

  .navigation-item {
    &:hover {
      background-color: var(--cogs-greyscale-grey8) !important;
      color: #fff !important;
    }
  }

  .navigation-item {
    background-color: var(--cogs-bg-inverted) !important;
    color: #fff !important;
  }

  .navigation-item.active {
    margin-top: 0 !important;
    height: 100% !important;
    color: var(--cogs-greyscale-grey1) !important;
  }

  .navigation-item.active:after {
    background-color: #fff !important;
  }

  .cogs-topbar--item__logo,
  .cogs-topbar--item__navigation {
    border-left: solid 1px var(--cogs-greyscale-grey8) !important;
    display: flex;
    align-items: center;
    align-self: center;
  }

  h6,
  .cogs-detail {
    color: #fff !important;
  }

  .cogs-topbar--item__navigation button {
    color: var(--cogs-greyscale-grey5) !important;

    .acitve {
      color: var(--cogs-text-inverted) !important;
    }
  }

  .cogs-icon-Cognite {
    width: 30px !important;
  }

  .actions-item {
    :hover {
      background-color: var(--cogs-greyscale-grey8) !important;
    }
  }

  .cogs-topbar--item__actions {
    border-left: none;
  }
`;

export const StyledButton = styled(Button)`
  color: var(--cogs-white);
  background-color: transparent;
`;
