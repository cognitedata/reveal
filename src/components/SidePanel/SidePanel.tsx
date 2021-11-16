import React, { useContext } from 'react';

import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import {
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
  SIDE_PANEL_WIDTH,
} from 'utils/constants';

import SidePanelFooter from './SidePanelFooter';
import SidePanelContent from './SidePanelContent';

const StyledSidePanelWrapper = styled.div<{ $isOpen: boolean }>`
  border-right: 1px solid ${Colors['border-default']};
  height: 100%;
  overflow: hidden;
  transition: width ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  width: ${({ $isOpen }) => ($isOpen ? SIDE_PANEL_WIDTH : 0)}px;
`;

const SidePanel = (): JSX.Element => {
  const { isSidePanelOpen } = useContext(RawExplorerContext);

  return (
    <StyledSidePanelWrapper $isOpen={isSidePanelOpen}>
      <SidePanelContent />
      <SidePanelFooter />
    </StyledSidePanelWrapper>
  );
};

export default SidePanel;
