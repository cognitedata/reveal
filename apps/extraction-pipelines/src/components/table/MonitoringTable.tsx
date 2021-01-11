import React, { useMemo } from 'react';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useExpanded,
  HeaderGroup,
  Cell,
  Row,
  Column,
} from 'react-table';
import { Run } from '../../model/Runs';

export interface TableProps {
  data: Run[];
  columns: Column<Run>[];
}

const MonitoringTable = ({ columns, data }: TableProps) => {
  const dataSource = useMemo(() => {
    return data;
  }, [data]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns: headerCols,
      data: dataSource,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded
  );

  return (
    <table {...getTableProps()} className="cogs-table">
      <thead>
        {headerGroups.map((headerGroup: HeaderGroup<Run>) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((col: HeaderGroup<Run>) => {
              return (
                <th
                  scope="col"
                  {...col.getHeaderProps(col.getSortByToggleProps())}
                  className={`${col.id}-col`}
                >
                  {col.disableFilters && col.render('Header')}
                  {!col.disableFilters && col.render('Filter')}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row<Run>) => {
          prepareRow(row);
          const isParentRow = row.subRows.length > 0;
          const isSeenStatusRow = !row.values.status;
          return (
            <tr
              {...row.getRowProps()}
              {...row.getToggleRowExpandedProps()}
              className={`cogs-table-row integrations-table-row ${
                row.isSelected ? 'row-active' : ''
              } ${isParentRow ? 'parent-row' : ''}
              ${isSeenStatusRow ? 'seen-status-row' : ''}`}
            >
              {row.cells.map((cell: Cell<Run>) => {
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

export default MonitoringTable;
