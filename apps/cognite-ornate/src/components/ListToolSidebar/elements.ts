import styled from 'styled-components';
import z from 'utils/z';

export const ListToolSidebarWrapper = styled.div`
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  z-index: ${z.LIST_TOOL_OVERLAY};
`;

export const ListToolItem = styled.div`
  width: 100%;
  background: white;
  display: flex;
  margin-bottom: 2px;
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
    width: 16px;
    opacity: 1;
    margin-top: -3px;
    margin-right: 8px;

    .caret-up,
    .caret-down {
      color: var(--cogs-primary);
      cursor: pointer;
      height: 8px;
      svg {
        position: relative;
        top: -2px;
      }
      &:disabled {
        cursor: default !important;
        color: grey;
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
  .list-item__status {
    cursor: pointer;
    width: 96px;
    margin-right: 12px;
    font-weight: bold;
    text-align: right;
    margin-left: auto;
  }
  .list-item__remove {
    cursor: pointer;
    opacity: 1;
    width: 16px;
  }
`;
