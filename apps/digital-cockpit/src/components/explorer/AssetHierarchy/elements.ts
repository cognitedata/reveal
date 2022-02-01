import styled from 'styled-components';

export const TreeNodeWrapper = styled.div`
  font-size: 14px;

  .loading-asset {
    position: relative;
  }
  & .loading-icon {
    position: absolute;
    left: 10px;
    top: 9px;
  }
  & .rc-collapse-item,
  & .rc-collapse-header {
    border: none !important;
  }
  & .rc-collapse-content-box {
    margin: 0;
  }
  & .rc-collapse-item > .rc-collapse-header {
    padding: 6px 16px;
  }
  & .leaf-item {
    padding: 6px 16px 6px 28px;
    margin: 0;
    background: white;
    color: #666666;
    cursor: pointer;
    line-height: 22px;
  }
  & .selected > .rc-collapse-header,
  & .selected.leaf-asset {
    font-weight: bold;
  }
`;
