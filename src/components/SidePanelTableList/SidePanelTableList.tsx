import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

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
import { Trans, useTranslation } from 'common/i18n';

const SidePanelTableList = (): JSX.Element => {
  const { t } = useTranslation();
  const {
    selectedSidePanelDatabase = '',
    setSelectedSidePanelDatabase,
    setIsSidePanelOpen,
  } = useContext(RawExplorerContext);
  const { flow } = getFlow();
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isFetching, isLoading, hasNextPage, fetchNextPage } = useTables(
    { database: selectedSidePanelDatabase },
    { enabled: !!selectedSidePanelDatabase }
  );

  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

  const [[activeDatabase, activeTable] = []] = useActiveTable();

  useEffect(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, fetchNextPage, hasNextPage]);

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

  // We're using this ref as a container for a "unique" value that will
  // remount the <CreateTableModal... /> whenever we close the modal.
  // We do this in order to reset the whole state and recreate the scope of the component
  // so we will have a clean slate when it comes to creating a new table.
  // This is most important due to the file upload that was causing multiple issues
  // with opening tabs in the raw explorer for tables that haven't been created successfully
  // and for stopping requests to fetch a resource that shouldn't exist.
  // By binding this refs `current` value as a key to the component React will force a
  // remount whenever it changes.
  const remountCount = useRef(0);

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
          <Tooltip
            content={
              <Trans i18nKey="explorer-side-panel-tables-access-warning" />
            }
            disabled={hasWriteAccess}
          >
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
        <Tooltip
          content={
            <Trans i18nKey="explorer-side-panel-tables-access-warning" />
          }
          disabled={hasWriteAccess}
        >
          <Button
            block
            disabled={!hasWriteAccess}
            icon="Add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('explorer-side-panel-tables-button-create-table')}
          </Button>
        </Tooltip>
      )}
      <CreateTableModal
        key={remountCount.current}
        databaseName={selectedSidePanelDatabase}
        onCancel={() => setIsCreateModalOpen(false)}
        onReset={() => {
          remountCount.current += 1;
        }}
        tables={tables}
        visible={isCreateModalOpen}
      />
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
