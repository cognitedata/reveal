import styled from 'styled-components';

export const CardContainer = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  border: 1px solid #fafafa;
  box-sizing: border-box;
  height: 100%;
  background: white;

  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);

  border-radius: 2px;
  > main {
    height: calc(100% - 56px);
    overflow: auto;
    padding: 8px 16px 16px;
    &.no-padding {
      padding: 0;
    }
  }
`;
