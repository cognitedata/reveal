import React, { FunctionComponent, PropsWithChildren, useMemo } from 'react';
import {
  Cell,
  Column,
  HeaderGroup,
  Row,
  useExpanded,
  useFilters,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { StatusRun } from 'model/Runs';

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
}
export const RunLogsTable: FunctionComponent<LogsTableProps> = ({
  data,
  columns,
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
    rows,
    prepareRow,
  } = useTable(
    {
      columns: headerCols,
      data: dataSource,
    },
    useFilters,
    useSortBy,
    useExpanded
  );
  return (
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
        {rows.map((row: Row<StatusRun>) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell: Cell<StatusRun>) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
};
