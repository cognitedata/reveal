import styled from 'styled-components';
import { zIndex } from '@data-exploration-lib/core';

export const AssetNodeWrapper = styled.div`
  .node-item {
    background: transparent;
  }
  & .node-name {
    padding: 6px 16px 6px 28px;
    margin: 0;
    color: var(--cogs-greyscale-grey7);
    cursor: pointer;
    line-height: 22px;
  }
  & .node-item-header {
    position: relative;
    & .node-icon .cogs-icon {
      z-index: ${zIndex.MAXIMUM};
      position: absolute;
      top: 8px;
      left: 10px;
      cursor: pointer;
    }
    & .node-icon.loading-icon .cogs-icon {
      cursor: auto;
    }
  }
  & .selected,
  & .selected.node-name {
    font-weight: bold;
  }
`;
