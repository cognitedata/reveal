import { Flex, Label } from '@cognite/cogs.js';
import { useMemo } from 'react';
import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  Column,
} from 'react-table';

import { Process } from './Processes';

const ProcessList = (props: { processes: Process[] | undefined }) => {
  const { processes } = props;
  const columns: Column[] = [
    {
      accessor: 'eventType',
      Header: 'Process Type',
    },
    {
      accessor: 'eventExternalId',
      Header: 'Extenal ID',
      Cell: ({ value }) => useMemo(() => <small>{value}</small>, []),
    },
    {
      accessor: 'eventCreationTime',
      Header: 'Started at',
    },
    {
      accessor: 'status',
      Header: 'Status',
      Cell: ({ value }) =>
        useMemo(
          () => (
            <Label
              variant={
                // eslint-disable-next-line no-nested-ternary
                value === 'FINISHED'
                  ? 'success'
                  : value === 'FAILED'
                  ? 'danger'
                  : 'warning'
              }
              iconPlacement="right"
            >
              {value}
            </Label>
          ),
          [value]
        ),
    },
  ];

  return processes ? (
    <ProcessTable
      tableOptions={{
        columns,
        data: processes,
        initialState: { pageIndex: 0, pageSize: 30 },
      }}
    />
  ) : null;
};

// Create a component to render your table
const ProcessTable = ({
  tableOptions,
}: {
  tableOptions: { columns: Column[]; data: Process[]; initialState: any };
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
