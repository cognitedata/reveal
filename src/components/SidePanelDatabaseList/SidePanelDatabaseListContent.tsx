import React, { useMemo } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';
import Tooltip from 'components/Tooltip/Tooltip';
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
  const { flow } = getFlow();
  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

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
            icon="Add"
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
          <Title level={6}>No results found.</Title>
          <StyledNoItemsDetail strong>
            The search “{searchQuery}” did not match any databases. Please try
            another search.
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelDatabaseListContent;
