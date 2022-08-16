import React, { useContext, useEffect } from 'react';

import { Colors, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';

import { useActiveTable } from 'hooks/table-tabs';

import { SidePanelItemProps } from 'components/SidePanelItem/SidePanelItem';
import SidePanelTableList from 'components/SidePanelTableList/SidePanelTableList';
import SidePanelDatabaseList from 'components/SidePanelDatabaseList/SidePanelDatabaseList';
import SidePanelItemHeader from 'components/SidePanelItem/SidePanelItemHeader';
import { RawExplorerSideMenuItem } from 'containers/RawExplorer/RawExplorer';

const RawSidePanel = (
  props: Omit<
    SidePanelItemProps<RawExplorerSideMenuItem>,
    'children' | 'footer' | 'title'
  >
): JSX.Element => {
  const { activePanelKey, onChange, onClose } = props;

  const { setSelectedSidePanelDatabase, selectedSidePanelDatabase } =
    useContext(RawExplorerContext);
  const [[activeDatabase] = []] = useActiveTable();

  useEffect(() => {
    if (activeDatabase && !selectedSidePanelDatabase)
      setSelectedSidePanelDatabase(activeDatabase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <SidePanelItemHeader<RawExplorerSideMenuItem>
        activePanelKey={activePanelKey}
        onChange={onChange!}
        onClose={onClose!}
        title="RAW Explorer" // TODO
      />
      <StyledContentWithLevels>
        {!selectedSidePanelDatabase ? (
          <StyledSidePanelItemLevelContainer>
            <SidePanelDatabaseList />
          </StyledSidePanelItemLevelContainer>
        ) : (
          <StyledSidePanelItemLevelContainer>
            <SidePanelTableList />
          </StyledSidePanelItemLevelContainer>
        )}
      </StyledContentWithLevels>
    </Flex>
  );
};

const StyledContentWithLevels = styled.div`
  border-color: ${Colors['border-default']};
  border-style: solid;
  border-width: 1px 0;
  flex: 1;
  display: flex;
  padding: 0;
  width: 100%;
  overflow: hidden;
`;

const StyledSidePanelItemLevelContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export default RawSidePanel;
