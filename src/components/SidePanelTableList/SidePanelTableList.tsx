import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Body, Button, Colors, Tooltip } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import styled from 'styled-components';

import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import { RawExplorerContext } from 'contexts';

import SidePanelTableListContent from './SidePanelTableListContent';
import SidePanelTableListHomeItem from './SidePanelTableListHomeItem';
import CreateTableModal from 'components/CreateTableModal/CreateTableModal';
import { useTables } from 'hooks/sdk-queries';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useActiveTable } from 'hooks/table-tabs';

const StyledSidePanelTableListHeaderWrapper = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledSidePanelTableListHeaderTitle = styled(Body)`
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 98px);
`;

const StyledSidePanelTableListHeaderIconDivider = styled.div`
  background-color: ${Colors['bg-control--disabled']};
  height: 16px;
  margin: 0 8px;
  width: 2px;
`;

const SidePanelTableList = (): JSX.Element => {
  const {
    selectedSidePanelDatabase = '',
    setSelectedSidePanelDatabase,
    setIsSidePanelOpen,
  } = useContext(RawExplorerContext);

  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, hasNextPage, fetchNextPage } = useTables(
    { database: selectedSidePanelDatabase },
    { enabled: !!selectedSidePanelDatabase }
  );

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const accessWarningContent = (
    <>
      To create tables, you need to have the <strong>raw:write</strong>{' '}
      capability
    </>
  );

  const [[activeDatabase, activeTable] = []] = useActiveTable();

  useEffect(() => {
    if (!isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [isLoading, fetchNextPage, hasNextPage]);

  const tables = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDBTable[]
          )
        : ([] as RawDBTable[]),
    [data]
  );

  return (
    <SidePanelLevelWrapper
      header={
        <StyledSidePanelTableListHeaderWrapper>
          <Button
            icon="ArrowBack"
            onClick={() => setSelectedSidePanelDatabase(undefined)}
            size="small"
            type="ghost"
          />
          <StyledSidePanelTableListHeaderTitle strong>
            {selectedSidePanelDatabase}
          </StyledSidePanelTableListHeaderTitle>
          <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
            <Button
              disabled={!hasWriteAccess}
              icon="PlusCompact"
              onClick={() => setIsCreateModalOpen(true)}
              size="small"
              type="primary"
            />
          </Tooltip>
          <StyledSidePanelTableListHeaderIconDivider />
          <Button
            disabled={!(activeDatabase && activeTable)}
            icon="PanelLeft"
            onClick={() => setIsSidePanelOpen(false)}
            size="small"
            type="secondary"
          />
        </StyledSidePanelTableListHeaderWrapper>
      }
      onQueryChange={setQuery}
      query={query}
      searchInputPlaceholder="Filter tables"
    >
      <SidePanelTableListHomeItem isEmpty={isLoading || !tables.length} />
      <SidePanelTableListContent searchQuery={query} tables={tables} />
      <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
        <Button
          block
          disabled={!hasWriteAccess}
          icon="PlusCompact"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create table
        </Button>
      </Tooltip>
      {isCreateModalOpen && (
        <CreateTableModal
          databaseName={selectedSidePanelDatabase}
          onCancel={() => setIsCreateModalOpen(false)}
          tables={tables}
          visible={isCreateModalOpen}
        />
      )}
    </SidePanelLevelWrapper>
  );
};

export default SidePanelTableList;
