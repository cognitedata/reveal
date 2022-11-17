// React Table already adds the key props
/* eslint-disable react/jsx-key */

import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  useExpanded,
  Column,
  IdType,
  Row,
} from 'react-table';
import { Flex, Pagination } from '@cognite/cogs.js';
import { DefaultCommonTableRow } from 'components/CommonTable/DefaultCommonTableRow';
import { Fragment } from 'react';

import { StyledTable } from './elements';
import { SortColumnIcon } from './SortColumnIcon';

type CommonTableProps<T extends object> = {
  data: readonly T[];
  columns: ReadonlyArray<Column<T>>;
  showPagination?: boolean;
  pageSize?: number;
  initialExpanded?: Record<IdType<T>, boolean>;
  rowComponent?: (row: Row<T>) => JSX.Element;
};

export function CommonTable<T extends object>({
  data,
  columns,
  showPagination = true,
  initialExpanded,
  rowComponent,
  pageSize = 10,
}: CommonTableProps<T>) {
  const expanded = initialExpanded ? { expanded: initialExpanded } : {};

  const {
    headerGroups,
    page,
    pageOptions,
    state: { pageIndex },
    getTableProps,
    getTableBodyProps,
    prepareRow,
    gotoPage,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize, ...expanded },
    },
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  // Render the UI for your table
  return (
    <>
      <StyledTable {...getTableProps()}>
        <thead>
          {headerGroups.map(({ getHeaderGroupProps, headers }) => (
            <tr {...getHeaderGroupProps()}>
              {headers.map(
                ({
                  canSort,
                  isSorted,
                  isSortedDesc,
                  render,
                  getHeaderProps,
                  getSortByToggleProps,
                }) => (
                  <th
                    {...getHeaderProps(getSortByToggleProps())}
                    className="cogs-body-2 strong"
                  >
                    <span>
                      {render('Header')}
                      {canSort && (
                        <SortColumnIcon
                          isSorted={isSorted}
                          isSortedDesc={isSortedDesc}
                        />
                      )}
                    </span>
                  </th>
                )
              )}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, _i) => {
            prepareRow(row);
            return (
              <Fragment key={row.getRowProps().key}>
                {rowComponent?.(row) ?? DefaultCommonTableRow(row)}
              </Fragment>
            );
          })}
        </tbody>
      </StyledTable>
      {showPagination && (
        <Flex style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Pagination
            initialCurrentPage={pageIndex + 1}
            totalPages={pageOptions.length}
            itemsPerPage={pageSize as any}
            onPageChange={(x) => gotoPage(() => x - 1)}
            hideItemsPerPage
          />
        </Flex>
      )}
    </>
  );
}
