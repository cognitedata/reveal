import { Flex, Label, Pagination } from '@cognite/cogs.js';
import { useEffect, useMemo, useRef } from 'react';
import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  Column,
} from 'react-table';

import { StyledTable } from './elements';
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
  const TableContainerRef = useRef<HTMLDivElement>(null);

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
    setPageSize,
    page,
    pageOptions,
    state: { pageIndex, pageSize },
    gotoPage,
  } = instance;

  useEffect(() => {
    const tableContainer = TableContainerRef.current;
    if (tableContainer) {
      const { height } = tableContainer.getBoundingClientRect();
      const pagination = 60;
      const rowHeight = 54;
      let pagesize = Math.floor((height - pagination - rowHeight) / rowHeight);
      if (pagesize < 10) {
        pagesize = 10;
      }
      setPageSize(pagesize);
    }
  }, [TableContainerRef]);

  // Render the UI for your table
  return (
    <div className="tableContainer" ref={TableContainerRef}>
      <StyledTable {...getTableProps()}>
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
      </StyledTable>
      <Flex style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Pagination
          current={pageIndex + 1}
          defaultCurrent={pageIndex + 1}
          total={pageOptions.length * pageSize}
          pageSize={pageSize}
          onChange={(x) => gotoPage(() => x - 1)}
        />
        <div>of {pageOptions.length}</div>
      </Flex>
    </div>
  );
};

export default ProcessList;
