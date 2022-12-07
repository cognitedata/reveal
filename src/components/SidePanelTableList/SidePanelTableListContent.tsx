import React, { useContext, useMemo } from 'react';

import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';

import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';

import { RawExplorerContext } from 'contexts';
import { stringCompare } from 'utils/utils';

import SidePanelTableListItem from './SidePanelTableListItem';
import { useTranslation } from 'common/i18n';

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
            {t('explorer-side-panel-tables-no-results-detail')}
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelTableListContent;
