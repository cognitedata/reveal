import React, { useContext, useMemo } from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from '@raw-explorer/components/SidePanel/SidePanelLevelWrapper';
import { RawExplorerContext } from '@raw-explorer/contexts';
import { stringCompare } from '@raw-explorer/utils/utils';

import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';

import SidePanelTableListItem from './SidePanelTableListItem';

type SidePanelTableListContentProps = {
  openCreateModal: () => void;
  searchQuery?: string;
  tables: RawDB[];
};

const SidePanelTableListContent = ({
  openCreateModal,
  searchQuery,
  tables,
}: SidePanelTableListContentProps): JSX.Element => {
  const { t } = useTranslation();
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);

  const filteredTableList = useMemo(() => {
    return (
      tables
        ?.filter(({ name }) =>
          name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
        )
        .sort((a, b) => stringCompare(a.name, b.name)) ||
      [] ||
      []
    );
  }, [searchQuery, tables]);

  if (!tables.length) {
    return (
      <StyledEmptyListWrapper>
        <StyledEmptyListTitle level={6}>
          {t('explorer-side-panel-tables-create-title')}
        </StyledEmptyListTitle>
        <StyledEmptyListDetail strong>
          {t('explorer-side-panel-tables-create-detail')}
        </StyledEmptyListDetail>

        <Button icon="Add" onClick={openCreateModal} type="primary">
          {t('explorer-side-panel-tables-create-button')}
        </Button>
      </StyledEmptyListWrapper>
    );
  }

  return (
    <>
      {filteredTableList.length > 0 ? (
        filteredTableList.map(({ name }) => (
          <SidePanelTableListItem
            key={name}
            databaseName={selectedSidePanelDatabase}
            tableName={name}
          />
        ))
      ) : (
        <StyledNoItemsWrapper>
          <Title level={6}>
            {t('explorer-side-panel-tables-no-results-title')}
          </Title>
          <StyledNoItemsDetail strong>
            {t('explorer-side-panel-tables-no-results-detail', {
              query: searchQuery,
            })}
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelTableListContent;
