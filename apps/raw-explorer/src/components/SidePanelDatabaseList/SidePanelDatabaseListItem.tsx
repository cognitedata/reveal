import React, { useContext, useMemo } from 'react';

import { Body, Colors, Detail, Icon } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk/';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import { useAllTables, useTableRows } from 'hooks/sdk-queries';

import SidePanelDatabaseListItemTooltip from './SidePanelDatabaseListItemTooltip';
import { useActiveTable } from 'hooks/table-tabs';
import { useSleep } from 'utils/utils';

type SidePanelDatabaseListItemProps = {
  name: string;
  delayTableCount?: number;
};

const StyledNavigationIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;

const StyledSidePanelDatabaseListItemWrapper = styled.button`
  align-items: center;
  background-color: ${Colors['surface--medium']};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  height: 40px;
  margin-bottom: 8px;
  padding: 0 8px;
  width: 100%;

  :hover {
    background-color: ${Colors['surface--interactive--toggled-default']};

    ${StyledNavigationIcon} {
      color: ${Colors['text-icon--interactive--pressed']};
    }
  }

  :active {
    background-color: ${Colors['surface--interactive--pressed']};
  }
`;

const StyledDatabaseIcon = styled(Icon)`
  color: ${Colors['text-icon--interactive--default']};
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
  background-color: ${Colors['surface--action--muted--hover']};
  border-radius: 4px;
  color: ${Colors['text-icon--medium']};
  display: flex;
  height: 20px;
  justify-content: center;
  margin-right: 4px;
  width: 20px;
`;

const SidePanelDatabaseListItem = ({
  name,
  delayTableCount = 0,
}: SidePanelDatabaseListItemProps): JSX.Element => {
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);
  const { isSuccess: enableCount } = useSleep(
    delayTableCount,
    `table-count-delay: ${name}`
  );

  const [[activeDatabase, activeTable] = []] = useActiveTable();
  const { isFetched, isError } = useTableRows(
    { database: activeDatabase!, table: activeTable!, pageSize: 100 },
    { enabled: !!activeDatabase && !!activeTable }
  );

  const { data, hasNextPage, isLoading } = useAllTables(
    {
      database: name,
    },
    {
      enabled:
        enableCount &&
        (isFetched || isError || !activeDatabase || !activeTable),
    }
  );

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
        {isLoading ? (
          <Icon type="Loader" />
        ) : (
          data &&
          !hasNextPage && (
            <StyledTableCount strong>{tables.length}</StyledTableCount>
          )
        )}
        <StyledNavigationIcon type="ChevronRight" />
      </StyledSidePanelDatabaseListItemWrapper>
    </SidePanelDatabaseListItemTooltip>
  );
};

export default SidePanelDatabaseListItem;
