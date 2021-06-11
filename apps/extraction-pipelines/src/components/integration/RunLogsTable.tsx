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
import { OptionType, Pagination, Select } from '@cognite/cogs.js';
import { RunUI } from 'model/Runs';
import { OptionTypeBase } from 'react-select';

const Wrapper = styled.div`
  margin-bottom: 5rem;
  display: grid;
  grid-template-areas: 'table table table' 'pagination select text';
  grid-template-columns: max-content 5rem 1fr;
  .cogs-select,
  .select-post-fix {
    align-self: center;
  }
  .select-post-fix {
    margin-left: 0.5rem;
  }
`;
const StyledTable = styled.table`
  grid-area: table;
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
const itemsPrPageOptions: OptionTypeBase[] = [
  {
    label: '10',
    value: 10,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];
interface LogsTableProps {
  data: RunUI[];
  columns: Column<RunUI>[];
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
    setPageSize,
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

  const handleSelectItemsPrPage = (option: OptionType) => {
    setPageSize(option?.value);
  };

  const findOptionValue = (
    options: OptionTypeBase[],
    innerPageSize: number
  ) => {
    return options.find(({ value }) => value === innerPageSize);
  };

  return (
    <Wrapper>
      <StyledTable {...getTableProps()} className="cogs-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<RunUI>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<RunUI>) => {
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
          {page.map((row: Row<RunUI>) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Cell<RunUI>) => {
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
      <Select
        value={findOptionValue(itemsPrPageOptions, pageSize)}
        onChange={handleSelectItemsPrPage}
        options={itemsPrPageOptions}
        menuPlacement="top"
      />
      <span className="select-post-fix">pr page</span>
    </Wrapper>
  );
};
