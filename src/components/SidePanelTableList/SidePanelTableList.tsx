import React, { useContext, useEffect, useMemo, useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Body, Button, Colors } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import Tooltip from 'components/Tooltip/Tooltip';
import { RawExplorerContext } from 'contexts';

import SidePanelTableListContent from './SidePanelTableListContent';
import SidePanelTableListHomeItem from './SidePanelTableListHomeItem';
import CreateTableModal from 'components/CreateTableModal/CreateTableModal';
import { useTables } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';

const accessWarningContent = (
  <>
    To create tables, you need to have the <strong>raw:write</strong> capability
  </>
);

const SidePanelTableList = (): JSX.Element => {
  const {
    selectedSidePanelDatabase = '',
    setSelectedSidePanelDatabase,
    setIsSidePanelOpen,
  } = useContext(RawExplorerContext);
  const { flow } = getFlow();
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, hasNextPage, fetchNextPage } = useTables(
    { database: selectedSidePanelDatabase },
    { enabled: !!selectedSidePanelDatabase }
  );

  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

  const [[activeDatabase, activeTable] = []] = useActiveTable();

  useEffect(() => {
    if (!isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [isLoading, fetchNextPage, hasNextPage]);

  useEffect(() => {
    setQuery('');
  }, [selectedSidePanelDatabase]);

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
            aria-label="Back"
            icon="ArrowLeft"
            onClick={() => setSelectedSidePanelDatabase(undefined)}
            size="small"
            type="ghost"
          />
          <StyledSidePanelTableListHeaderTitle strong>
            {selectedSidePanelDatabase}
          </StyledSidePanelTableListHeaderTitle>
          <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
            <Button
              aria-label="Create table"
              disabled={!hasWriteAccess}
              icon="Add"
              onClick={() => setIsCreateModalOpen(true)}
              size="small"
              type="primary"
            />
          </Tooltip>
          <StyledSidePanelTableListHeaderIconDivider />
          <Button
            aria-label="Hide side panel"
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
      <SidePanelTableListContent
        openCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={query}
        tables={tables}
      />
      {!!tables.length && (
        <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
          <Button
            block
            disabled={!hasWriteAccess}
            icon="Add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create table
          </Button>
        </Tooltip>
      )}
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

export default SidePanelTableList;
