import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useExpanded,
  HeaderGroup,
  Cell,
  Row,
} from 'react-table';
import StatusMarker from '../integrations/cols/StatusMarker';
import Wrapper from '../../styles/StyledTable';
import { mockDataRunsResponse } from '../../utils/mockResponse';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import StatusFilterDropdown from '../table/StatusFilterDropdown';
import SorterIndicator from '../table/SorterIndicator';
import {
  TableProps,
  CellProps,
  RunsAPIResponse,
  IntegrationProps,
  RunAPIProps,
  RunsProps,
  RunProps,
} from '../../model/Runs';

const Table = ({ columns, data }: TableProps) => {
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
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded
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
                  {col.canSort && <SorterIndicator sCol={col} />}
                  {!col.disableFilters && col.render('Filter')}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row) => {
          prepareRow(row);
          const isParentRow = row.subRows.length > 0;
          const isChildRow = row.depth === 1;
          return (
            <tr
              {...row.getRowProps()}
              className={`cogs-table-row integrations-table-row ${
                row.isSelected ? 'row-active' : ''
              } ${isParentRow ? 'parent-row' : ''}
              ${isChildRow ? 'child-row' : ''}`}
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

const mapRuns = (response: RunsAPIResponse) => {
  const result: RunsProps[] = [];
  response.items.forEach((item: IntegrationProps) => {
    item.statuses.forEach((status: RunAPIProps) => {
      const run: RunProps = {
        timestamp: status.timestamp,
        status: '',
        statusSeen: 'OK',
        subRows: [],
      };
      let indexParentRun;

      switch (status.status) {
        case 'success':
          run.status = 'OK';
          result.push(run);
          break;
        case 'failure':
          run.status = 'FAIL';
          result.push(run);
          break;
        case 'seen':
          indexParentRun = result.length - 1;
          result[indexParentRun].subRows.push(run);
          break;
      }
    });
  });
  return result;
};

const SidePanelTable = () => {
  const data = useMemo(() => mapRuns(mockDataRunsResponse), []);

  const columns = useMemo(
    () => [
      {
        Header: 'Seen',
        accessor: 'timestamp',
        sortType: 'basic',
        Cell: (cell: Cell) => {
          return <TimeDisplay value={cell.value} relative withTooltip />;
        },
        disableFilters: true,
      },
      {
        Header: 'Last run',
        accessor: 'status',
        Cell: (cell: Cell) => {
          return <StatusMarker status={cell.value} />;
        },
        disableSortBy: true,
        Filter: StatusFilterDropdown,
        filter: 'includes',
        disableFilters: false,
      },
      {
        Header: 'Last seen',
        accessor: 'statusSeen',
        Cell: ({ row, cell }: CellProps) =>
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 2}rem`,
                },
              })}
            >
              <StatusMarker status={cell.value} />
              {row.isExpanded ? <Icon type="Down" /> : <Icon type="Right" />}
            </span>
          ) : (
            <StatusMarker status={cell.value} />
          ),
        disableSortBy: true,
        Filter: StatusFilterDropdown,
        filter: 'includes',
        disableFilters: false,
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
