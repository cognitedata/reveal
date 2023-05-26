import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SortingState } from '@tanstack/react-table';

import { Button } from '@cognite/cogs.js';

import { Table } from '../components/table/Table';
import { Page } from '../containers/page/Page';
import { useNavigation } from '../hooks/useNavigation';
import { useListDataTypeQuery } from '../services/dataTypes/queries/useListDataTypeQuery';

const colums = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'id', accessorKey: 'externalId' },
];

export const ListPage = () => {
  const navigate = useNavigation();
  const { dataType } = useParams();

  const [sorting, setSorting] = useState<SortingState>([]);

  // Todo: move this to generic place...
  const normalizeSort = useMemo(() => {
    if (sorting.length === 0) {
      return undefined;
    }

    const { id, desc } = sorting[0];
    return {
      [id]: desc ? 'DESC' : 'ASC',
    };
  }, [sorting]);

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    useListDataTypeQuery(normalizeSort);

  return (
    <Page>
      <Page.Body loading={isLoading}>
        <Table
          id="list-table"
          data={data}
          columns={colums}
          manualSorting
          sorting={sorting}
          onSort={setSorting}
          enableSorting
          onRowClick={(row) => {
            navigate.toInstancePage(dataType!, row.space, row.externalId);
          }}
        />

        <Button
          loading={isFetchingNextPage}
          disabled={!hasNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more
        </Button>
      </Page.Body>
    </Page>
  );
};
