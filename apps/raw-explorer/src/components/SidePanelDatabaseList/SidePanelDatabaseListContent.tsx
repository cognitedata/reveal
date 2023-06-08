import React, { useMemo } from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from '@raw-explorer/components/SidePanel/SidePanelLevelWrapper';
import { stringCompare } from '@raw-explorer/utils/utils';

import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';

import SidePanelDatabaseListItem from './SidePanelDatabaseListItem';

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
        filteredDatabaseList.map(({ name }, index) => (
          <SidePanelDatabaseListItem
            key={name}
            name={name}
            delayTableCount={50 * (index + 1)}
          />
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
