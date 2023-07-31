import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ListToolPopupWrapper = styled.div`
  position: fixed;
  bottom: 16px;
  background: white;
`;

export const ListToolItem = styled.div`
  width: 100%;
  background: white;
  display: flex;
  padding: 12px 16px;
  align-items: center;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  font-size: 16px;

  &:hover {
    .list-item__reorder {
      opacity: 1;
    }
    .list-item__remove {
      opacity: 1;
    }
  }

  .list-item__reorder {
    display: flex;
    flex-direction: column;
    width: 16px;
    opacity: 1;
    margin-top: -3px;
    margin-right: 8px;

    .caret-up,
    .caret-down {
      color: var(--cogs-primary);
      cursor: pointer;
      height: 8px;
      padding: 0;
      svg {
        position: relative;
        top: -2px;
      }
      &:disabled {
        cursor: default !important;
        color: grey;
        background: inherit;
      }
    }
  }

  .list-item__number {
    font-weight: bold;
    color: var(--cogs-primary);
    padding-right: 12px;
  }
  .list-item__text {
    width: 168px;
    text-align: left;
    color: rgba(51, 51, 51, 1);

    border: none;
  }
  .list-item__remove {
    cursor: pointer;
    opacity: 1;
    width: 16px;
  }
`;

export const ListItemStatusButton = styled(Button)`
  &&& {
    cursor: pointer;
    width: 96px;
    margin-right: 12px;
    font-weight: bold;
    text-align: right;
    margin-left: auto;
  }
`;
