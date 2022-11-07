/*
 * Copyright 2021 Cognite AS
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
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    display: block;
  }
`;

export const Loader = styled.div<{ isLoading: boolean }>`
  background: black;
  color: white;
  display: ${(props) => (props.isLoading ? 'block' : 'none')};
`;
