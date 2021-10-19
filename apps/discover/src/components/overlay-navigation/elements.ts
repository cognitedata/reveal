import styled from 'styled-components/macro';

import layers from '_helpers/zindex';

export const OverlayNavigationContainer = styled.div`
  position: absolute;
  background: var(--cogs-bg-default);
  z-index: ${layers.OVERLAY_NAVIGATION};
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;
