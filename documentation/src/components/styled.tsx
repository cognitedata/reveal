/*!
 * Copyright 2020 Cognite AS
 */

import styled from 'styled-components';

export const CanvasWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  max-height: 100%;
  overflow: hidden;
  & > canvas {
    display: block;
  }
`;
