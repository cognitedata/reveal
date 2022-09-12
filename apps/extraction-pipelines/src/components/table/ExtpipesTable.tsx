import React, { ReactNode, ReactText, useMemo } from 'react';
import {
  Cell,
  HeaderGroup,
  Row,
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import { matchSorter } from 'match-sorter';
import { useHistory } from 'react-router-dom';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';

import ExtpipeTableSearch from 'components/table/ExtpipeTableSearch';
import { Colors, Flex, Pagination } from '@cognite/cogs.js';
import styled from 'styled-components';
import { StyledTable } from 'components/styled';
import Layers from 'utils/zindex';
import { getProject } from '@cognite/cdf-utilities';
import { Extpipe } from 'model/Extpipe';
import { useAllExtpipes } from 'hooks/useExtpipes';
import { getExtpipeTableColumns } from './ExtpipeTableCol';
import { useTranslation } from 'common';

const fuzzyTextFilterFn = <T extends { values: any }>(
  rows: ReadonlyArray<T>,
  id: string,
  filterValue: any
) => {
  return matchSorter([...rows], filterValue, {
    keys: [(row) => row.values[id]],
  });
};
fuzzyTextFilterFn.autoRemove = (val: boolean) => !val;

interface Props {
  tableActionButtons: ReactNode;
}
const ExtpipesTable = <T extends { id: ReactText }>({
  tableActionButtons,
}: Props) => {
  const { t } = useTranslation();
  const project = getProject();
  const history = useHistory();
  const { extpipeTableColumns: columns } = useMemo(
    () => getExtpipeTableColumns(t),
    [t]
  );

  const { data } = useAllExtpipes();

  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: (rows: { values: any }[], id: string, filterValue: any) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const allPipelines = useMemo(
    () =>
      data?.pages.reduce((accl, p) => [...accl, ...p.items], [] as Extpipe[]) ||
      [],
    [data?.pages]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    //    rows,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    preGlobalFilteredRows,

    gotoPage,
    pageCount,
    setPageSize,
  } = useTable<Extpipe>(
    {
      columns,
      data: allPipelines,
      pageCount: data?.pages.length,
      autoResetFilters: false,
      autoResetGlobalFilter: false,
      autoResetSortBy: false,
      //@ts-ignore
      filterTypes,
      initialState: {
        pageIndex: 0,
        pageSize: 25,
        hiddenColumns: ['externalId'],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <>
      <StyledExtpipesTable>
        <TableTop>
          <ExtpipeTableSearch
            globalFilter={state.globalFilter}
            preGlobalFilteredRows={preGlobalFilteredRows}
            setGlobalFilter={setGlobalFilter}
          />
          <div>{tableActionButtons}</div>
        </TableTop>
        <StyledTable2
          {...getTableProps()}
          className="cogs-table extpipes-table"
          role="grid"
          aria-label={`List of extraction pipelines for the ${project} project`}
        >
          <thead>
            {headerGroups.map((headerGroup: HeaderGroup<any>) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((col: HeaderGroup<T>) => {
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
            {page.map((row: Row<Extpipe>) => {
              prepareRow(row);

              return (
                <tr
                  {...row.getRowProps()}
                  className={`cogs-table-row extpipes-table-row`}
                >
                  {row.cells.map((cell: Cell<Extpipe>) => {
                    const handleCellClick = (
                      e: React.MouseEvent<HTMLTableDataCellElement>
                    ) => {
                      if (e.currentTarget === e.target) {
                        history.push(
                          createExtPipePath(
                            `/${EXT_PIPE_PATH}/${row.original.id}`
                          )
                        );
                      }
                    };
                    // Name column has focusable link for accessibility. Cell click handler is for easy access for mouse users
                    return (
                      <td
                        {...cell.getCellProps()}
                        className={`${cell.column.id}-cell`}
                        onClick={handleCellClick}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </StyledTable2>
        <Flex
          justifyContent="end"
          direction="row"
          style={{ marginTop: '1rem' }}
        >
          <Pagination
            initialCurrentPage={1}
            totalPages={pageCount}
            hideItemsPerPage={pageCount <= 1}
            itemsPerPage={state.pageSize as 50}
            setItemPerPage={(size) => setPageSize(size)}
            onPageChange={(page) => {
              gotoPage(page - 1);
            }}
          />
        </Flex>
      </StyledExtpipesTable>
    </>
  );
};

const TableTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledExtpipesTable = styled(StyledTable)`
  margin: 1rem 0;

  table {
    border-collapse: collapse;
    width: 100%;
    th,
    td {
      padding: 0.5rem 1rem;
    }
    th {
      background: ${Colors.white.hex()};
      z-index: ${Layers.MINIMUM};
    }
  }
`;

const StyledTable2 = styled.table`
  table-layout: fixed;
  tbody td {
    word-break: break-word;
    color: ${Colors['greyscale-grey8'].hex()};
  }
`;

export default ExtpipesTable;
