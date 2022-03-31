import React, { useContext, useMemo } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  StyledEmptyListDetail,
  StyledEmptyListTitle,
  StyledEmptyListWrapper,
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';
import Tooltip from 'components/Tooltip/Tooltip';

import { RawExplorerContext } from 'contexts';
import { stringCompare } from 'utils/utils';

import SidePanelTableListItem from './SidePanelTableListItem';

const accessWarningContent = (
  <>
    To create tables, you need to have the <strong>raw:write</strong> capability
  </>
);

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
  const { flow } = getFlow();
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);

  const { data: hasWriteAccess } = usePermissions(flow, 'rawAcl', 'WRITE');

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
        <StyledEmptyListTitle level={6}>Create a table</StyledEmptyListTitle>
        <StyledEmptyListDetail strong>
          All raw data is stored in tables. Create a table to upload a file or
          write data directly using the API.
        </StyledEmptyListDetail>

        <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
          <Button
            disabled={!hasWriteAccess}
            icon="Add"
            onClick={openCreateModal}
            type="primary"
          >
            Create table
          </Button>
        </Tooltip>
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
          <Title level={6}>No results found.</Title>
          <StyledNoItemsDetail strong>
            The search “{searchQuery}” did not match any tables. Please try
            another search.
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelTableListContent;
