import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { WhiteLoader } from './WhiteLoader';

const Wrapper = styled.div`
  position: absolute;
  background: var(--cogs-bg-default);
  z-index: ${layers.OVERLAY_LOADER};
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

export const WhiteLoaderOverlay: React.FC = () => {
  return (
    <Wrapper>
      <WhiteLoader />
    </Wrapper>
  );
};
