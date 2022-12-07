import React, { useMemo } from 'react';

import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';

import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';

import { stringCompare } from 'utils/utils';

import SidePanelDatabaseListItem from './SidePanelDatabaseListItem';
import { useTranslation } from 'common/i18n';

type SidePanelDatabaseListContentProps = {
  databases: RawDB[];
  openCreateModal: () => void;
  searchQuery?: string;
};

const SidePanelDatabaseListContent = ({
  databases,
  openCreateModal,
  searchQuery,
}: SidePanelDatabaseListContentProps): JSX.Element => {
  const { t } = useTranslation();

  const filteredDatabaseList = useMemo(() => {
    return (
      databases
        ?.filter(({ name }) =>
          name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
        )
        .sort((a, b) => stringCompare(a.name, b.name)) || []
    );
  }, [databases, searchQuery]);

  if (!databases.length) {
    return (
      <StyledEmptyListWrapper>
        <StyledEmptyListTitle level={6}>
          {t('explorer-side-panel-databases-create-title')}
        </StyledEmptyListTitle>
        <StyledEmptyListDetail strong>
          {t('explorer-side-panel-databases-create-detail')}
        </StyledEmptyListDetail>

        <Button icon="Add" onClick={openCreateModal} type="primary">
          {t('explorer-side-panel-databases-button-create-database')}
        </Button>
      </StyledEmptyListWrapper>
    );
  }

  return (
    <>
      {filteredDatabaseList.length > 0 ? (
        filteredDatabaseList.map(({ name }) => (
          <SidePanelDatabaseListItem key={name} name={name} />
        ))
      ) : (
        <StyledNoItemsWrapper>
          <Title level={6}>
            {t('explorer-side-panel-databases-no-results-title')}
          </Title>
          <StyledNoItemsDetail strong>
            {t('explorer-side-panel-databases-no-results-detail')}
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelDatabaseListContent;
