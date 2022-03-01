import styled from 'styled-components';

export const CardContainer = styled.div`
  justify-content: center;
  background: white;
  display: flex;
  flex-direction: column;
  border: 1px solid #fafafa;
  box-sizing: border-box;
  height: 100%;
  background: white;

  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);

  border-radius: 4px;
  position: relative;
  top: 0px;
  transition: all 0.15s;
  &:hover {
    box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.08),
      0px 2px 10px rgba(0, 0, 0, 0.06);
    top: -2px;
  }

  > main {
    height: calc(100% - 56px);
    overflow: auto;
    padding: 8px 16px 16px;
    &.no-padding {
      padding: 0;
    }
  }

  &.card-mini {
    width: 80px;
    height: 80px;
    display: inline-flex;
    .card-header {
      margin: auto;
      flex-direction: column;
      h3 {
        padding-top: 8px;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;
      }
    }

    .icon-container {
      width: 32px;
      height: 32px;
      margin: auto;
    }

    > div {
      padding: 0;
    }
  }
`;
