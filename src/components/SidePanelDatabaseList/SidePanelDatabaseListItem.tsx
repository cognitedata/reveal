import React, { useContext, useEffect, useMemo } from 'react';

import { Body, Colors, Detail, Icon } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import { useTables } from 'hooks/sdk-queries';

import SidePanelDatabaseListItemTooltip from './SidePanelDatabaseListItemTooltip';

type SidePanelDatabaseListItemProps = {
  name: string;
};

const StyledNavigationIcon = styled(Icon)`
  color: ${Colors['text-hint']};
`;

const StyledSidePanelDatabaseListItemWrapper = styled.button`
  align-items: center;
  background-color: ${Colors['bg-accent']};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  height: 40px;
  margin-bottom: 8px;
  padding: 0 8px;
  width: 100%;

  :hover {
    background-color: ${Colors['bg-hover']};

    ${StyledNavigationIcon} {
      color: ${Colors['bg-control--primary-pressed']};
    }
  }

  :active {
    background-color: ${Colors['bg-selected']};
  }
`;

const StyledDatabaseIcon = styled(Icon)`
  color: ${Colors['bg-status-small--accent-pressed']};
  margin-right: 8px;
`;

const StyledDatabaseName = styled(Body)`
  margin-right: 8px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 72px);
`;

const StyledTableCount = styled(Detail)`
  align-items: center;
  background-color: ${Colors['bg-control--secondary-hover']};
  border-radius: 4px;
  color: ${Colors['text-secondary']};
  display: flex;
  height: 20px;
  justify-content: center;
  margin-right: 4px;
  width: 20px;
`;

const SidePanelDatabaseListItem = ({
  name,
}: SidePanelDatabaseListItemProps): JSX.Element => {
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  const { data, isFetching, hasNextPage, fetchNextPage } = useTables({
    database: name,
  });

  useEffect(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, fetchNextPage, hasNextPage]);

  const tables = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDB[]
          )
        : ([] as RawDB[]),
    [data]
  );

  const handleDatabaseListItemClick = (): void => {
    setSelectedSidePanelDatabase(name);
  };

  return (
    <SidePanelDatabaseListItemTooltip name={name} tables={tables}>
      <StyledSidePanelDatabaseListItemWrapper
        onClick={handleDatabaseListItemClick}
      >
        <StyledDatabaseIcon type="DataSource" />
        <StyledDatabaseName level={3}>{name}</StyledDatabaseName>
        {!hasNextPage && (
          <StyledTableCount strong>{tables.length}</StyledTableCount>
        )}
        <StyledNavigationIcon type="ChevronRight" />
      </StyledSidePanelDatabaseListItemWrapper>
    </SidePanelDatabaseListItemTooltip>
  );
};

export default SidePanelDatabaseListItem;
