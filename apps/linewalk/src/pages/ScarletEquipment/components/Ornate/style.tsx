import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

export const LoaderContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;

  > div {
    position: absolute;
  }
`;
