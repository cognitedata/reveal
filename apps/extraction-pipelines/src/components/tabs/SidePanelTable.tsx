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
import { mockDataRunsResponse } from '../../utils/mockResponse';

interface ITableProps {
  data: {
    timestamp: number;
    status: string;
    statusSeen: string;
  }[];
  columns: Column[];
}

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

const timeFromNow = (time: number) => {
  const date = moment(time);
  const isToday = date.valueOf() > moment().startOf('day').valueOf();
  const isYesterday =
    date.valueOf() > moment().subtract(1, 'days').startOf('day').valueOf();
  if (isToday) {
    return `Today ${date.format('HH:mm')}`;
  }
  if (isYesterday) {
    return `Yesterday ${date.format('HH:mm')}`;
  }
  return `${date.fromNow()} ${date.format('HH:mm')}`;
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
  const data = useMemo(() => mockDataRunsResponse, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Seen',
        accessor: 'timestamp',
        sortType: 'basic',
        Cell: (cell: Cell) => {
          return timeFromNow(cell.value);
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
