import React, { useContext, useMemo } from 'react';

import { Detail, Button, Colors, Title, Tooltip } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import styled from 'styled-components';

import {
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';

import { RawExplorerContext } from 'contexts';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
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
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');

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
      <StyledEmptyDatabaseWrapper>
        <StyledEmptyDatabaseTitle level={6}>
          Create a table
        </StyledEmptyDatabaseTitle>
        <StyledEmptyDatabaseDetail strong>
          All raw data is stored in tables. Create a table to upload a file or
          write data directly using the API.
        </StyledEmptyDatabaseDetail>

        <Tooltip content={accessWarningContent} disabled={hasWriteAccess}>
          <Button
            disabled={!hasWriteAccess}
            icon="PlusCompact"
            onClick={openCreateModal}
            type="primary"
          >
            Create table
          </Button>
        </Tooltip>
      </StyledEmptyDatabaseWrapper>
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

const StyledEmptyDatabaseWrapper = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent'].hex()};
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 36px 48px;
`;

const StyledEmptyDatabaseTitle = styled(Title)`
  color: ${Colors['text-primary'].hex()};
`;

const StyledEmptyDatabaseDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  margin: 8px 0 16px;
  text-align: center;
`;

export default SidePanelTableListContent;
