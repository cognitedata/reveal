import styled from 'styled-components/macro';

export default styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;

  main,
  #chart-view {
    height: calc(100% - 56px);
    display: flex;
    flex-direction: row;
  }
  #chart-view {
    height: 100%;
  }
`;
