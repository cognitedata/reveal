import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
  Column,
} from 'react-table';
import { Flex, Pagination } from '@cognite/cogs.js';
import { Process, Workflow } from 'types';

import { StyledTable } from './elements';

export const ReusableTable = ({
  data,
  columns,
  className = '',
}: {
  data: (Workflow | Process)[];
  columns: Column[];
  className?: string;
}) => {
  const {
    headerGroups,
    page,
    pageOptions,
    state: { pageIndex, pageSize },
    ...tableInstance
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy,
    usePagination
  );

  // Render the UI for your table
  return (
    <div className="tableContainer">
      <StyledTable {...tableInstance.getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th {...column.getHeaderProps()} className="cogs-body-2 strong">
                  {column.render('Header')}
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
              <tr {...row.getRowProps()} className={className}>
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
      <Flex style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Pagination
          initialCurrentPage={pageIndex + 1}
          totalPages={pageOptions.length}
          itemsPerPage={pageSize as any}
          onPageChange={(x) => tableInstance.gotoPage(() => x - 1)}
          hideItemsPerPage
        />
      </Flex>
    </div>
  );
};
