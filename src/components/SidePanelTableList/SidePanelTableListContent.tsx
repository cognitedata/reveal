import React, { useContext, useMemo } from 'react';

import { Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';

import {
  StyledNoItemsDetail,
  StyledNoItemsWrapper,
} from 'components/SidePanel/SidePanelLevelWrapper';

import { RawExplorerContext } from 'contexts';
import { stringCompare } from 'utils/utils';

import SidePanelTableListItem from './SidePanelTableListItem';

type SidePanelTableListContentProps = {
  searchQuery?: string;
  tables: RawDB[];
};

const SidePanelTableListContent = ({
  searchQuery,
  tables,
}: SidePanelTableListContentProps): JSX.Element => {
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
          <Title level={6}>There are no items here.</Title>
          <StyledNoItemsDetail strong>
            Search for documents by source, format, type, creation date and more
          </StyledNoItemsDetail>
        </StyledNoItemsWrapper>
      )}
    </>
  );
};

export default SidePanelTableListContent;
