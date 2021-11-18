import React, { useState } from 'react';
import { Flex, Loader } from '@cognite/cogs.js';
import { useTableData } from 'hooks/table-data';
import { FilterBar } from './FilterBar';
import { Table } from './Table';

export const Spreadsheet = (): JSX.Element => {
  const { rows, columns, isLoading, isFetched, hasNextPage, fetchNextPage } =
    useTableData();
  const [columnFilter, setColumnFilter] = useState('');
  const isEmpty = isFetched && !rows?.length;

  const filteredColumns = [
    ...columns.slice(0, 1),
    ...columns
      .slice(1)
      .filter((column) =>
        column.title.toLowerCase().includes(columnFilter.toLowerCase())
      ),
  ];

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar
        isEmpty={isEmpty}
        columnFilter={columnFilter}
        setColumnFilter={setColumnFilter}
      />
      {isLoading ? (
        <Loader />
      ) : (
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
      )}
    </Flex>
  );
};
