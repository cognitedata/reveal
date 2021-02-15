import { Pagination } from '@cognite/cogs.js';
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
  usePagination,
  TableState,
} from 'react-table';

export interface TableProps<T extends object = {}> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE: Readonly<number> = 10;
const MonitoringTable = <T extends {}>({
  columns,
  data,
  pageSize: propPageSize = DEFAULT_PAGE_SIZE,
}: TableProps<T>) => {
  const dataSource = useMemo(() => {
    return data;
  }, [data]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);
  const initialState: Partial<TableState<T>> = {
    pageIndex: 0,
    pageSize: propPageSize ?? dataSource.length,
  };
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    state: { pageIndex, pageSize },
    gotoPage,
  } = useTable<T>(
    {
      columns: headerCols,
      data: dataSource,
      initialState,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination
  );

  return (
    <>
      <table {...getTableProps()} className="cogs-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<T>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<T>) => {
                return (
                  <th
                    scope="col"
                    {...col.getHeaderProps(col.getSortByToggleProps())}
                    className={`${col.id}-col`}
                  >
                    {col.disableFilters
                      ? col.render('Header')
                      : col.render('Filter')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: Row<T>) => {
            prepareRow(row);
            const isParentRow = row.subRows.length > 0;
            const isSeenStatusRow = !row.values.status;
            return (
              <tr
                {...row.getRowProps()}
                {...row.getToggleRowExpandedProps()}
                className={`cogs-table-row integrations-table-row ${
                  row.isSelected && 'row-active'
                } ${isParentRow && 'parent-row'}
              ${isSeenStatusRow && 'seen-status-row'}`}
              >
                {row.cells.map((cell: Cell<T>) => {
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
      {rows.length > 0 && (
        <div className="cogs-table-pagination">
          <Pagination
            current={pageIndex + 1}
            defaultCurrent={pageIndex + 1}
            total={rows.length}
            pageSize={pageSize}
            onChange={(x) => gotoPage(x - 1)}
          />
        </div>
      )}
    </>
  );
};

export default MonitoringTable;
