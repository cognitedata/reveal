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
import { useTranslation } from 'common/i18n';

const RawSidePanel = (
  props: Omit<
    SidePanelItemProps<RawExplorerSideMenuItem>,
    'children' | 'footer' | 'title' | 'onChange'
  >
): JSX.Element => {
  const { activePanelKey, onClose } = props;

  const { t } = useTranslation();

  const {
    isSidePanelOpen,
    setIsSidePanelOpen,
    setSelectedSidePanelDatabase,
    selectedSidePanelDatabase,
  } = useContext(RawExplorerContext);
  const [active] = useActiveTable();
  const [activeDatabase] = active ?? [];

  useEffect(() => {
    // Force the sidebar to open when we close all of the tabs,
    // which wouldn't allow the user to open the sidebar again.
    if (!active && !isSidePanelOpen) {
      setIsSidePanelOpen(true);
    }
  }, [active, isSidePanelOpen, setIsSidePanelOpen]);

  useEffect(() => {
    if (activeDatabase && !selectedSidePanelDatabase)
      setSelectedSidePanelDatabase(activeDatabase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <SidePanelItemHeader<RawExplorerSideMenuItem>
        activePanelKey={activePanelKey}
        onClose={onClose}
        title={t('raw-explorer-title')}
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
