import React from 'react';
import { Flex, Loader } from '@cognite/cogs.js';
import { useTableData } from 'hooks/table-data';
import { FilterBar } from './FilterBar';
import { Table } from './Table';

export const Spreadsheet = (): JSX.Element => {
  const { rows, columns, isLoading, isFetched, hasNextPage, fetchNextPage } =
    useTableData();
  const isEmpty = isFetched && !rows?.length;

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar isEmpty={isEmpty} />
      {isLoading ? (
        <Loader />
      ) : (
        <Table
          isEmpty={isEmpty}
          rows={rows}
          columns={columns}
          onEndReach={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
        />
      )}
    </Flex>
  );
};
