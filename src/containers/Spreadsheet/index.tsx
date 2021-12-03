import React from 'react';
import { Colors, Icon, Flex, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useActiveTableContext } from 'contexts';
import { useTableData } from 'hooks/table-data';
import { useRawProfile } from 'hooks/profiling-service';

import { FilterBar } from './FilterBar';
import { Table } from './Table';

const Loading = styled.p`
  position: absolute;
  bottom: 24px;
  left: 50%;
  text-align: center;
  background-color: ${Colors.midblue.hex()};
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
`;

export const Spreadsheet = (): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const { isFetching } = useRawProfile({ database, table });
  const {
    rows,
    filteredColumns,
    isLoading,
    isFetched,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useTableData();

  const isEmpty = isFetched && !rows?.length;

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar
        key={`${database}_${table}`}
        isEmpty={isEmpty}
        isProfilingFetching={isFetching}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Table
            isEmpty={isEmpty}
            rows={rows}
            columns={filteredColumns}
            onEndReach={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
          {isFetched && isFetching && (
            <Loading>
              <Icon
                type="LoadingSpinner"
                size={12}
                style={{ marginRight: 8 }}
              />
              Loading more data
            </Loading>
          )}
        </>
      )}
    </Flex>
  );
};
