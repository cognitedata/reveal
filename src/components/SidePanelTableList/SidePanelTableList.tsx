import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import { RawExplorerContext } from 'contexts';
import SidePanelTableListContent from './SidePanelTableListContent';
import SidePanelTableListHomeItem from './SidePanelTableListHomeItem';
import CreateTableModal from 'components/CreateTableModal/CreateTableModal';
import { useAllTables } from 'hooks/sdk-queries';
import { useTranslation } from 'common/i18n';

const SidePanelTableList = (): JSX.Element => {
  const { t } = useTranslation();
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useAllTables(
    { database: selectedSidePanelDatabase },
    { enabled: !!selectedSidePanelDatabase }
  );

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
      selectedSidePanelDatabase={selectedSidePanelDatabase}
      openCreateModal={() => setIsCreateModalOpen(true)}
      searchInputPlaceholder={t(
        'explorer-side-panel-tables-filter-placeholder'
      )}
      onQueryChange={setQuery}
      query={query}
    >
      <SidePanelTableListHomeItem isEmpty={isLoading || !tables.length} />
      <SidePanelTableListContent
        openCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={query}
        tables={tables}
      />

      <Button block icon="Add" onClick={() => setIsCreateModalOpen(true)}>
        {t('explorer-side-panel-tables-button-create-table')}
      </Button>

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

export default SidePanelTableList;
