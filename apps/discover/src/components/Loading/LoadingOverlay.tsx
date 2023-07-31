import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { LOADING_TEXT } from './constants';
import { Loading } from './Loading';

const Wrapper = styled.div`
  position: absolute;
  background: var(--cogs-bg-default);
  z-index: ${layers.OVERLAY_LOADER};
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;
export const LoadingOverlay: React.FC<{ text?: string }> = (
  { text } = { text: LOADING_TEXT }
) => {
  return (
    <Wrapper>
      <Loading loadingTitle={text} />
    </Wrapper>
  );
};
