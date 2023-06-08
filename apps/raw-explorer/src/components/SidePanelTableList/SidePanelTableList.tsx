import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import SidePanelLevelWrapper from 'components/SidePanel/SidePanelLevelWrapper';
import { RawExplorerContext } from 'contexts';
import SidePanelTableListContent from './SidePanelTableListContent';
import SidePanelTableListHomeItem from './SidePanelTableListHomeItem';
import CreateTableModal from 'components/CreateTableModal/CreateTableModal';
import { useAllTables } from 'hooks/sdk-queries';
import { useTranslation } from 'common/i18n';
import styled from 'styled-components';

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
      <StyledButton icon="Add" onClick={() => setIsCreateModalOpen(true)}>
        {t('explorer-side-panel-tables-button-create-table')}
      </StyledButton>
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

const StyledButton = styled(Button)`
  &&& {
    display: flex !important;
    width: 100%;
  }
`;

export default SidePanelTableList;
