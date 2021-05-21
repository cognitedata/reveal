import React, { FunctionComponent, PropsWithChildren, useMemo } from 'react';
import {
  Cell,
  Column,
  HeaderGroup,
  Row,
  useExpanded,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { Pagination } from '@cognite/cogs.js';
import { StatusRun } from 'model/Runs';

const Wrapper = styled.div`
  margin-bottom: 5rem;
`;
const StyledTable = styled.table`
  thead {
    tr {
      .createdTime-col {
        width: 12rem;
      }
      .status-col {
        width: 9rem;
      }
    }
  }
`;

interface LogsTableProps {
  data: StatusRun[];
  columns: Column<StatusRun>[];
  fetchData: (params: { pageSize: number }) => void;
  pageCount: number;
  pageSize: number;
}
export const RunLogsTable: FunctionComponent<LogsTableProps> = ({
  data,
  columns,
  fetchData,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
}: PropsWithChildren<LogsTableProps>) => {
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
    page,
    rows,
    prepareRow,
    gotoPage,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: headerCols,
      data: dataSource,
      initialState: { pageIndex: 0, pageSize: controlledPageSize },
      pageCount: controlledPageCount,
    },
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  React.useEffect(() => {
    fetchData({ pageSize });
  }, [fetchData, pageSize]);

  const paginationChanged = (current: number) => {
    gotoPage(current - 1);
  };
  return (
    <Wrapper>
      <StyledTable {...getTableProps()} className="cogs-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<StatusRun>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<StatusRun>) => {
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
          {page.map((row: Row<StatusRun>) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Cell<StatusRun>) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
      <Pagination
        current={pageIndex + 1}
        defaultCurrent={pageIndex + 1}
        total={rows.length}
        pageSize={pageSize}
        onChange={paginationChanged}
        locale={{ goTo: 'Go to' }}
      />
    </Wrapper>
  );
};
