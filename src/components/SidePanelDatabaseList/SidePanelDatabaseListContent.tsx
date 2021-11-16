import React, { useMemo } from 'react';

import { Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';

import {
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';
import { stringCompare } from 'utils/utils';

import SidePanelDatabaseListItem from './SidePanelDatabaseListItem';

type SidePanelDatabaseListContentProps = {
  databases: RawDB[];
  searchQuery?: string;
};

const SidePanelDatabaseListContent = ({
  databases,
  searchQuery,
}: SidePanelDatabaseListContentProps): JSX.Element => {
  const filteredDatabaseList = useMemo(() => {
    return (
      databases
        ?.filter(({ name }) =>
          name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
        )
        .sort((a, b) => stringCompare(a.name, b.name)) || []
    );
  }, [databases, searchQuery]);

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
