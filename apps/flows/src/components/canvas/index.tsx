import styled from 'styled-components';

import { FlowBuilder } from '../flow-builder';

export const Canvas = (): JSX.Element => {
  return (
    <CanvasContainer>
      <FlowBuilder />
    </CanvasContainer>
  );
};

const CanvasContainer = styled.div`
  height: 100%;
  width: 100%;
`;
