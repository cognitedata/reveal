import styled from 'styled-components';

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
    & .node-icon {
      z-index: 100;
      position: absolute;
      top: 8px;
      left: 10px;
      cursor: pointer;
    }
    & .node-icon.loading-icon {
      cursor: auto;
    }
  }
  & .selected,
  & .selected.node-name {
    font-weight: bold;
  }
`;
