import { Flex, Label } from '@cognite/cogs.js';
import { CogniteClient, CogniteEvent } from '@cognite/sdk';
import { fetchSingleEvent } from 'queries/useFetchEvents';
import { useEffect, useMemo } from 'react';
import { useQueries } from 'react-query';
import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  Column,
} from 'react-table';

import { Process } from './Processes';

const ProcessList = (props: {
  processes: Process[];
  client: CogniteClient;
  updateProcess: (externalId: string, newData: Process) => void;
}) => {
  const { processes, client, updateProcess } = props;

  const columns: Column[] = [
    {
      accessor: 'name',
      Header: 'Process Name',
    },
    {
      accessor: 'externalId',
      Header: 'Extenal ID',
      Cell: ({ value }) => useMemo(() => <small>{value}</small>, []),
    },
    {
      accessor: 'startTime',
      Header: 'From',
    },
    {
      accessor: 'endTime',
      Header: 'To',
    },
    {
      accessor: 'time',
      Header: 'Executed',
      Cell: ({ value }) => value.toLocaleString(),
    },
    {
      accessor: 'status',
      Header: 'Status',
      Cell: ({ value }) =>
        useMemo(
          () => (
            <Label
              variant={value === 'Bid Matrix Ready' ? 'success' : 'warning'}
              icon={value === 'Bid Matrix Ready' ? false : 'Loader'}
              iconPlacement="right"
            >
              {value}
            </Label>
          ),
          [value]
        ),
    },
  ];

  return (
    <ProcessTable
      tableOptions={{
        columns,
        data: processes,
        initialState: { pageIndex: 0, pageSize: 10 },
      }}
      updateProcess={updateProcess}
      client={client}
    />
  );
};

// Create a component to render your table
const ProcessTable = ({
  tableOptions,
  client,
  updateProcess,
}: {
  tableOptions: { columns: Column[]; data: Process[]; initialState: any };
  client: CogniteClient;
  updateProcess: (externalId: string, newData: Process) => void;
}) => {
  // Use the useTable hook to create your table configuration
  const instance = useTable(
    {
      columns: tableOptions.columns,
      data: tableOptions.data,
      initialState: {
        ...tableOptions.initialState,
      },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageOptions,
    state: { pageIndex, pageSize },
    // gotoPage,
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
  } = instance;

  const eventQueries = useQueries(
    page.map((row) => {
      return {
        queryKey: ['process', row.values.externalId],
        queryFn: () =>
          fetchSingleEvent({
            client,
            externalId: row.values.externalId,
          }),
      };
    })
  );

  useEffect(() => {
    eventQueries
      .filter((query) => query?.data?.[0])
      .map((query) => query?.data?.[0])
      .forEach((event: CogniteEvent | undefined) => {
        if (event?.externalId) {
          const process = tableOptions.data.find(
            (p) => p.externalId === event.externalId
          );
          if (
            event.metadata &&
            event.metadata?.['shop:endtime'] !== process?.endTime
          ) {
            updateProcess(event.externalId, {
              id: event.id,
              name: event.type!,
              externalId: event.externalId!,
              startTime: event.metadata?.['shop:endtime'] || '',
              endTime: event.metadata?.['shop:endtime'] || '',
              time: event.createdTime,
              status: 'Returned from server',
            });
          }
        }
      });
  }, [eventQueries]);

  // Render the UI for your table
  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, _i) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Flex gap={8}>
        <button
          type="button"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          Previous Page
        </button>
        <button
          type="button"
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          Next Page
        </button>
        <div>
          Page{' '}
          <em>
            {pageIndex + 1} of {pageOptions.length}
          </em>
        </div>
        <div>Page size: {pageSize}</div>
        {/* <div>Go to page:</div>
        <input
          type="number"
          defaultValue={pageIndex + 1 || 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
        /> */}
      </Flex>
    </div>
  );
};

export default ProcessList;
