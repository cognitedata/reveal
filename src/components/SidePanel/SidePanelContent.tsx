import React, { useContext, useEffect } from 'react';

import styled from 'styled-components';

import SidePanelDatabaseList from 'components/SidePanelDatabaseList/SidePanelDatabaseList';
import SidePanelTableList from 'components/SidePanelTableList/SidePanelTableList';
import { useActiveTable } from 'hooks/table-tabs';
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
  const { setSelectedSidePanelDatabase, selectedSidePanelDatabase } =
    useContext(RawExplorerContext);
  const [[activeDatabase] = []] = useActiveTable();

  useEffect(() => {
    if (activeDatabase && !selectedSidePanelDatabase)
      setSelectedSidePanelDatabase(activeDatabase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledSidePanelContent $isDatabaseLevelActive={!selectedSidePanelDatabase}>
      <SidePanelDatabaseList />
      <SidePanelTableList />
    </StyledSidePanelContent>
  );
};

export default SidePanelContent;
