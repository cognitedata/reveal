import React, { useMemo } from 'react';
import { Badge } from '@cognite/cogs.js';
import moment from 'moment';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useExpanded,
  HeaderGroup,
  Column,
  Cell,
  Row,
} from 'react-table';
import { SortingIcon } from './TabsStyle';
import Wrapper from '../../styles/TablesStyle';

interface ITableProps {
  data: {
    timestamp: number;
    status: string;
    statusSeen: string;
  }[];
  columns: Column[];
}

const makeData = [
  {
    timestamp: 1605475298134,
    status: 'Failure',
    statusSeen: 'Seen',
  },
  { timestamp: 1605318198134, status: '', statusSeen: 'Seen' },
  { timestamp: 1604918198134, status: 'Failure', statusSeen: 'Seen' },
  { timestamp: 1604218198134, status: 'Success', statusSeen: 'Seen' },
  { timestamp: 1603918198134, status: 'Success', statusSeen: 'Seen' },
  { timestamp: 1600923198134, status: 'Success', statusSeen: 'Seen' },
];

const showSorterIndicator = (sCol: HeaderGroup) => {
  if (!sCol.disableSortBy) {
    if (sCol.isSorted) {
      if (sCol.isSortedDesc) {
        return <SortingIcon type="SortDown" />;
      }
      return <SortingIcon type="SortUp" />;
    }
    return <SortingIcon type="OrderDesc" />;
  }
  return '';
};

const statusBadge = (status: string) => {
  if (status === 'Success' || status === 'Seen') {
    return <Badge text="OK" size={13} background="#2ACF58" />;
  }
  if (status === 'Failure') {
    return <Badge text="FAIL" size={13} background="#DB0657" />;
  }
  return '';
};

const Table = ({ columns, data }: ITableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    useSortBy,
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <table {...getTableProps()} className="cogs-table integrations-table">
      <thead>
        {headerGroups.map((headerGroup: HeaderGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((col: HeaderGroup) => {
              return (
                <th
                  {...col.getHeaderProps(col.getSortByToggleProps())}
                  className={`${col.id}-col`}
                >
                  {col.render('Header')}
                  {showSorterIndicator(col)}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row) => {
          prepareRow(row);
          return (
            <tr
              {...row.getRowProps()}
              className={`cogs-table-row integrations-table-row ${
                row.isSelected ? 'row-active' : ''
              }`}
            >
              {row.cells.map((cell: Cell) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className={`${cell.column.id}-col`}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const SidePanelTable = () => {
  const data = useMemo(() => makeData, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Seen',
        accessor: 'timestamp',
        sortType: 'basic',
        Cell: (cell: Cell) => {
          const date = moment(cell.value);
          return `${date.fromNow()} ${date.format('HH:mm')}`;
        },
      },
      {
        Header: 'Last run',
        accessor: 'status',
        disableSortBy: true,
        Cell: (cell: Cell) => {
          return statusBadge(cell.value);
        },
      },
      {
        Header: 'Last seen',
        accessor: 'statusSeen',
        disableSortBy: true,
        Cell: (cell: Cell) => {
          return statusBadge(cell.value);
        },
      },
    ],
    []
  );

  return (
    <Wrapper>
      <Table columns={columns} data={data} />
    </Wrapper>
  );
};

export default SidePanelTable;
