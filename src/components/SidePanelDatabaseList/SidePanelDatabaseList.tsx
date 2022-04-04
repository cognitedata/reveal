import React, { useContext, useEffect, useMemo, useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Body, Button, Colors } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import CreateDatabaseModal from 'components/CreateDatabaseModal/CreateDatabaseModal';
import Tooltip from 'components/Tooltip/Tooltip';
import { RawExplorerContext } from 'contexts';
import { useDatabases } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';

import SidePanelDatabaseListContent from './SidePanelDatabaseListContent';

const accessWarningContent = (
  <>
    To create databases, you need to have the <strong>raw:write</strong>{' '}
    capability
  </>
);

const SidePanelDatabaseList = (): JSX.Element => {
  const { flow } = getFlow();
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, fetchNextPage, isFetching, hasNextPage } = useDatabases();

  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

  const [[activeDatabase, activeTable] = []] = useActiveTable();

  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetching]);

  const databases = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDB[]
          )
        : ([] as RawDB[]),
    [data]
  );

  const { setIsSidePanelOpen } = useContext(RawExplorerContext);

  return (
    <SidePanelLevelWrapper
      header={
        <StyledSidePanelDatabaseListHeaderWrapper>
          <StyledSidePanelDatabaseListHeaderTitle strong>
            RAW Explorer
          </StyledSidePanelDatabaseListHeaderTitle>
          <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
            <Button
              aria-label="Create database"
              disabled={!hasWriteAccess}
              icon="Add"
              onClick={() => setIsCreateModalOpen(true)}
              size="small"
              type="primary"
            />
          </Tooltip>
          <StyledSidePanelDatabaseListHeaderIconDivider />
          <Button
            aria-label="Hide side panel"
            disabled={!(activeDatabase && activeTable)}
            icon="PanelLeft"
            onClick={() => setIsSidePanelOpen(false)}
            size="small"
            type="secondary"
          />
        </StyledSidePanelDatabaseListHeaderWrapper>
      }
      searchInputPlaceholder="Filter databases"
      onQueryChange={setQuery}
      query={query}
    >
      <SidePanelDatabaseListContent
        databases={databases}
        openCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={query}
      />
      {!!databases.length && (
        <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
          <Button
            block
            disabled={!hasWriteAccess}
            icon="Add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create database
          </Button>
        </Tooltip>
      )}
      <CreateDatabaseModal
        databases={databases}
        onCancel={() => setIsCreateModalOpen(false)}
        visible={isCreateModalOpen}
      />
    </SidePanelLevelWrapper>
  );
};

const StyledSidePanelDatabaseListHeaderWrapper = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledSidePanelDatabaseListHeaderTitle = styled(Body)`
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 62px);
`;

const StyledSidePanelDatabaseListHeaderIconDivider = styled.div`
  background-color: ${Colors['bg-control--disabled']};
  height: 16px;
  margin: 0 8px;
  width: 2px;
`;

export default SidePanelDatabaseList;
