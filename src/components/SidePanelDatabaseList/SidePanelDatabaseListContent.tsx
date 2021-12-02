import React, { useMemo } from 'react';

import { Button, Title, Tooltip } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';

import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { stringCompare } from 'utils/utils';

import SidePanelDatabaseListItem from './SidePanelDatabaseListItem';

const accessWarningContent = (
  <>
    To create tables, you need to have the <strong>raw:write</strong> capability
  </>
);

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
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');

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
        <StyledEmptyListTitle level={6}>Create a database</StyledEmptyListTitle>
        <StyledEmptyListDetail strong>
          Databases are used for separating different source systems and contain
          tables with your data.
        </StyledEmptyListDetail>
        <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
          <Button
            disabled={!hasWriteAccess}
            icon="PlusCompact"
            onClick={openCreateModal}
            type="primary"
          >
            Create database
          </Button>
        </Tooltip>
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
          <Title level={6}>There are no items here.</Title>
          <StyledNoItemsDetail strong>
            Search for documents by source, format, type, creation date and more
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelDatabaseListContent;
