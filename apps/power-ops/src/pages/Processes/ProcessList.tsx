import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import { Flex, Pagination } from '@cognite/cogs.js';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Process } from 'types';

import { StyledTable } from './elements';
import { processListColumns } from './utils';

const ProcessList = ({
  processes,
  className = '',
}: {
  processes: Process[];
  className?: string;
}) => {
  const match = useRouteMatch();
  const history = useHistory();

  const {
    headerGroups,
    page,
    pageOptions,
    state: { pageIndex, pageSize },
    ...tableInstance
  } = useTable(
    {
      columns: processListColumns,
      data: processes,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns:
          className === 'all-processes' ? [] : ['subProcessStatuses'],
      },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const handleRowClick = (row: any) => {
    if (match.path.split('/', -1).slice(-1)[0] === 'processes')
      history.push(`${match.path}/${row.eventExternalId}`);
  };

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
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...tableInstance.getTableBodyProps()}>
          {page.map((row, _i) => {
            tableInstance.prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr
                {...row.getRowProps()}
                onClick={() => handleRowClick(row.values)}
                className={className}
              >
                {row.cells.map((cell) => (
                  // eslint-disable-next-line react/jsx-key
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
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

export default ProcessList;
