import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  HeaderGroup,
  UseTableOptions,
} from 'react-table';
import { Flex, Icon, Pagination } from '@cognite/cogs.js';

import { StyledTable } from './elements';

type ReusableTableProps<T extends object> = {
  data: UseTableOptions<T>['data'];
  columns: UseTableOptions<T>['columns'];
  showPagination?: boolean;
  pageSize?: number;
};

export function ReusableTable<T extends object>({
  data,
  columns,
  showPagination = true,
  pageSize = 10,
}: ReusableTableProps<T>) {
  const {
    headerGroups,
    page,
    pageOptions,
    state: { pageIndex },
    ...tableInstance
  } = useTable<T>(
    {
      columns,
      data,
      initialState: { pageSize },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const sortColumnIcon = (column: HeaderGroup<T>) => {
    if (column.isSorted) {
      return column.isSortedDesc ? (
        <Icon type="ReorderDescending" />
      ) : (
        <Icon type="ReorderAscending" />
      );
    }
    return <Icon type="ReorderDefault" />;
  };

  // Render the UI for your table
  return (
    <>
      <StyledTable {...tableInstance.getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="cogs-body-2 strong"
                >
                  <span>
                    {column.render('Header')}
                    {column.canSort && sortColumnIcon(column)}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...tableInstance.getTableBodyProps()}>
          {page.map((row, _i) => {
            tableInstance.prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  // eslint-disable-next-line react/jsx-key
                  <td {...cell.getCellProps()} className="cogs-body-2">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
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
            onPageChange={(x) => tableInstance.gotoPage(() => x - 1)}
            hideItemsPerPage
          />
        </Flex>
      )}
    </>
  );
}
