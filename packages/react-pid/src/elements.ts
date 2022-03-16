import styled from 'styled-components';

export const ReactPidWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;

export const ReactPidLayout = styled.div`
  display: grid;
  grid-template-columns: 300px auto;
  grid-auto-rows: 100%;
  height: 100%;
`;

export const LoaderOverlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
`;
