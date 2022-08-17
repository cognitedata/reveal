import React, { useContext, useEffect } from 'react';

import { Button, Colors, Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import SidePanelTableList from 'components/SidePanelTableList/SidePanelTableList';
import SidePanelDatabaseList from 'components/SidePanelDatabaseList/SidePanelDatabaseList';
import { useTranslation } from 'common/i18n';
import { RawExplorerContext } from 'contexts';
import { useActiveTable } from 'hooks/table-tabs';

type RawSidePanelProps = {
  onClose: () => void;
};

const RawSidePanel = ({ onClose }: RawSidePanelProps): JSX.Element => {
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
      <StyledHeader>
        <StyledTitle level={5}>{t('raw-explorer-title')}</StyledTitle>
        <StyledHeaderRight>
          <Button icon="PanelLeft" onClick={onClose} size="small" />
        </StyledHeaderRight>
      </StyledHeader>
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

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

const StyledTitle = styled(Title)`
  white-space: nowrap;

  :not(:first-child) {
    margin-left: 8px;
  }
`;

const StyledHeaderRight = styled.div`
  margin-left: auto;
`;

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
