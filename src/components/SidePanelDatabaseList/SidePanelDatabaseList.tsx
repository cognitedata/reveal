import React, { useMemo, useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';

import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import CreateDatabaseModal from 'components/CreateDatabaseModal/CreateDatabaseModal';
import { useAllDatabases } from 'hooks/sdk-queries';

import SidePanelDatabaseListContent from './SidePanelDatabaseListContent';
import { useTranslation } from 'common/i18n';

const SidePanelDatabaseList = (): JSX.Element => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data } = useAllDatabases();

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

  return (
    <SidePanelLevelWrapper
      openCreateModal={() => setIsCreateModalOpen(true)}
      searchInputPlaceholder={t(
        'explorer-side-panel-databases-filter-placeholder'
      )}
      onQueryChange={setQuery}
      query={query}
    >
      <SidePanelDatabaseListContent
        databases={databases}
        openCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={query}
      />
      {!!databases.length && (
        <Button block icon="Add" onClick={() => setIsCreateModalOpen(true)}>
          {t('explorer-side-panel-databases-button-create-database')}
        </Button>
      )}
      <CreateDatabaseModal
        databases={databases}
        onCancel={() => setIsCreateModalOpen(false)}
        visible={isCreateModalOpen}
      />
    </SidePanelLevelWrapper>
  );
};

export default SidePanelDatabaseList;
