import { useState } from 'react';

import styled from 'styled-components';

import { SortingState } from '@tanstack/react-table';

// import { Button } from '@cognite/cogs.js';

import { Table } from '../components/table/Table';
import { Page } from '../containers/page/Page';

const colums = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'id', accessorKey: 'externalId' },
];

export const ListPage = () => {
  // const navigate = useNavigation();
  // const { dataType } = useParams();

  const [sorting, setSorting] = useState<SortingState>([]);

  // Todo: move this to generic place...
  // const normalizeSort = useMemo(() => {
  //   if (sorting.length === 0) {
  //     return undefined;
  //   }

  //   const { id, desc } = sorting[0];
  //   return {
  //     [id]: desc ? 'DESC' : 'ASC',
  //   };
  // }, [sorting]);

  // const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
  //   useListDataTypeQuery(normalizeSort);

  return (
    <Page>
      <Page.Body loading={false}>
        <Table
          id="list-table"
          data={[]}
          columns={colums}
          manualSorting
          sorting={sorting}
          onSort={setSorting}
          enableSorting
          // onRowClick={(row) => {
          //   // navigate.toInstancePage(dataType!, row.space, row.externalId);
          // }}
        />

        <ButtonContainer>
          {/* <Button
            loading={isFetchingNextPage}
            disabled={!hasNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button> */}
        </ButtonContainer>
      </Page.Body>
    </Page>
  );
};

const ButtonContainer = styled.div`
  padding: 16px 0;
`;
