import styled from 'styled-components';

import { Canvas } from 'components/canvas';

const Flow = (): JSX.Element => {
  return (
    <StyledFlowContainer>
      <Canvas />
    </StyledFlowContainer>
  );
};

const StyledFlowContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export default Flow;
