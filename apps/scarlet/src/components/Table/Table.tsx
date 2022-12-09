/* eslint-disable react/jsx-key */
import React, { useEffect } from 'react';
import {
  useTable,
  usePagination,
  PluginHook,
  TableState,
  useResizeColumns,
  useSortBy,
  useFilters,
  HeaderGroup,
  useFlexLayout,
} from 'react-table';
import { Graphic, Pagination, Icon, IconType } from '@cognite/cogs.js';

import { TableProps, TableData } from './types';

export type { Column as TableColumn, Row as TableRow } from 'react-table';

export const RANGE_OPTIONS = [10, 25, 50, 100, 250] as const;

export const Table = <T extends TableData>({
  columns,
  dataSource,
  locale,
  pagination = true,
  onRowClick,
  onRow,
  rowClassName,
  flexLayout = false,
  pageSize: propsPageSize = 10,
  rowKey = (_, i) => String(i),
  tableConfig,
}: TableProps<T>) => {
  const { emptyText } = locale || {};
  const plugins = [
    useFilters,
    useSortBy,
    useResizeColumns,
    flexLayout && useFlexLayout,
    usePagination,
  ].filter(Boolean) as Array<PluginHook<T>>;

  const initialState: Partial<TableState<T>> = {
    pageSize: pagination ? propsPageSize : dataSource.length,
  };

  const defaultColumn = flexLayout || {
    minWidth: 100,
    width: 200,
    maxWidth: 400,
    Filter: undefined,
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    pageCount,
    setPageSize,
    gotoPage,
    state: { pageIndex, pageSize },
  } = useTable<T>(
    {
      columns,
      data: dataSource,
      initialState,
      getRowId: rowKey,
      pageSize: pagination ? propsPageSize : dataSource.length,
      defaultColumn,
      ...tableConfig,
    },
    ...plugins
  );

  console.log({ page, pageCount, setPageSize, gotoPage });

  useEffect(() => {
    setPageSize(pagination ? propsPageSize : dataSource.length);
  }, [dataSource, pagination, propsPageSize]);

  const renderSort = ({ canSort, isSorted, isSortedDesc }: HeaderGroup<T>) => {
    if (!canSort) {
      return null;
    }
    let sortIcon: IconType = 'ReorderDefault';
    if (isSorted) {
      sortIcon = isSortedDesc ? 'ReorderDescending' : 'ReorderAscending';
    }
    return (
      <span className={`cogs-table-sort ${isSorted ? 'sorted' : ''}`}>
        <Icon type={sortIcon} />
      </span>
    );
  };

  const renderPagination = () => {
    if (pagination && rows.length > 0) {
      return (
        <div className="cogs-table-pagination">
          <Pagination
            itemsPerPage={pageSize as typeof RANGE_OPTIONS[number]}
            initialCurrentPage={pageIndex + 1}
            totalPages={pageCount}
            setItemPerPage={setPageSize}
            onPageChange={(newPage) => gotoPage(newPage - 1)}
          />
        </div>
      );
    }
    return null;
  };

  const renderEmptyState = () => {
    if (emptyText) {
      return <div className="cogs-table">{emptyText}</div>;
    }

    return (
      <div className="cogs-table no-data">
        <Graphic type="Search" />
        You have no data in this table.
      </div>
    );
  };

  const isAnyFiltersApplied = headerGroups.some((group) =>
    group.headers.some(
      (header) => header.filterValue && header.filterValue.length >= 0
    )
  );

  if (!isAnyFiltersApplied && rows.length === 0) {
    return renderEmptyState();
  }

  return (
    <>
      <table
        {...getTableProps()}
        className={`cogs-table ${flexLayout && 'cogs-table-flex-layout'}`}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <div className="cogs-th-container">
                    {column.render('Header')}
                    {renderSort(column)}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {(page || rows)?.map((row) => {
            prepareRow(row);
            let additionalProps: React.HTMLAttributes<HTMLElement> = {};
            if (onRow) {
              const { original, index, ...rest } = row;
              additionalProps = onRow(original, index, { ...rest });
            }

            return (
              <React.Fragment
                key={rowKey ? rowKey(row.original, row.index) : row.index}
              >
                <tr
                  {...row.getRowProps()}
                  className={
                    rowClassName
                      ? rowClassName(row.original, row.index)
                      : 'cogs-table-row'
                  }
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} {...additionalProps}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {renderPagination()}
    </>
  );
};
