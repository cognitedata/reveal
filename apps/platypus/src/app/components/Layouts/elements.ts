import styled from 'styled-components/macro';

export const StyledPageContentLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;

  .body {
    display: flex;
    flex: 1;
    overflow: auto;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
  }
`;

export const StyledPageLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex: 1;
  overflow: auto;

  .page {
    flex: 1;
  }

  .content {
    flex: 1;
  }
`;
