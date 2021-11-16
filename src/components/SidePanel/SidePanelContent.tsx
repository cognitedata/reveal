import React, { useContext } from 'react';

import styled from 'styled-components';

import SidePanelDatabaseList from 'components/SidePanelDatabaseList/SidePanelDatabaseList';
import SidePanelTableList from 'components/SidePanelTableList/SidePanelTableList';
import { RawExplorerContext } from 'contexts';
import {
  SIDE_PANEL_FOOTER_HEIGHT,
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
  SIDE_PANEL_WIDTH,
} from 'utils/constants';

const StyledSidePanelContent = styled.div<{
  $isDatabaseLevelActive: boolean;
}>`
  display: flex;
  height: calc(100% - ${SIDE_PANEL_FOOTER_HEIGHT}px);
  transform: translate(
    ${({ $isDatabaseLevelActive }) =>
      ($isDatabaseLevelActive ? 0 : -1) * SIDE_PANEL_WIDTH}px
  );
  transition: transform ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  width: ${SIDE_PANEL_WIDTH * 2}px;
`;

const SidePanelContent = (): JSX.Element => {
  const { selectedSidePanelDatabase } = useContext(RawExplorerContext);

  return (
    <StyledSidePanelContent $isDatabaseLevelActive={!selectedSidePanelDatabase}>
      <SidePanelDatabaseList />
      <SidePanelTableList />
    </StyledSidePanelContent>
  );
};

export default SidePanelContent;
