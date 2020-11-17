import styled from 'styled-components/macro';

export default styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;

  main,
  #chart-view {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  #chart-view {
    height: 100%;
  }
`;
