import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexColumn } from 'styles/layout';

import { OverlayNavigationProps } from './OverlayNavigation';

export const OverlayNavigationContainer = styled(FlexColumn)`
  position: absolute;
  background: var(--cogs-bg-default);
  z-index: ${layers.OVERLAY_NAVIGATION};
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
  visibility: hidden;
  ${(props: OverlayNavigationProps) => `
    ${props.mount ? 'visibility: visible' : 'max-height: 0'};
  `}
`;
