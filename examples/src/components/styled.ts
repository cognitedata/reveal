/*
 * Copyright 2020 Cognite AS
 */
import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const CanvasWrapper = styled(Container)`
  position: relative;
  overflow: hidden;
  & > canvas {
    display: flex;
    flex-grow: 1;
    max-height: 100vh;
  }
`;

export const Loader = styled.div<{ isLoading: boolean }>`
  background: black;
  color: white;
  display: ${(props) => (props.isLoading ? 'block' : 'none')};
`;
