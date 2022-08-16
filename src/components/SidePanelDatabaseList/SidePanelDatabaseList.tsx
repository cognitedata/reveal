import React, { useEffect, useMemo, useState } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import CreateDatabaseModal from 'components/CreateDatabaseModal/CreateDatabaseModal';
import Tooltip from 'components/Tooltip/Tooltip';
import { useDatabases } from 'hooks/sdk-queries';

import SidePanelDatabaseListContent from './SidePanelDatabaseListContent';
import { Trans, useTranslation } from 'common/i18n';

const SidePanelDatabaseList = (): JSX.Element => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const [query, setQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, fetchNextPage, isFetching, hasNextPage } = useDatabases();

  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

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
        <Tooltip
          content={
            <Trans i18nKey="explorer-side-panel-databases-access-warning" />
          }
          disabled={hasWriteAccess}
        >
          <Button
            block
            disabled={!hasWriteAccess}
            icon="Add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('explorer-side-panel-databases-button-create-database')}
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

export default SidePanelDatabaseList;
