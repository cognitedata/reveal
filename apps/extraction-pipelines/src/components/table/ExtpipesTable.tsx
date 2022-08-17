import React, { ReactNode, ReactText, useMemo } from 'react';
import {
  ActionType,
  Cell,
  Column,
  HeaderGroup,
  Row,
  TableState,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';
import { matchSorter } from 'match-sorter';
import { useHistory } from 'react-router-dom';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import ExtpipeTableSearch from 'components/table/ExtpipeTableSearch';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Span3, StyledTable } from 'components/styled';
import Layers from 'utils/zindex';
import { Extpipe } from 'model/Extpipe';
import { getProject } from '@cognite/cdf-utilities';

const selectReducer = (
  newState: TableState,
  action: ActionType,
  previousState: TableState
) => {
  switch (action.type) {
    case 'toggleRowSelected':
      return {
        ...previousState,
        selectedRowIds: { [action.id]: action.value },
      };
    default:
      return { ...previousState, ...newState };
  }
};

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
  extpipes: Extpipe[];
  columns: Column<Extpipe>[];
  tableActionButtons: ReactNode;
}
const ExtpipesTable = <T extends { id: ReactText }>({
  extpipes,
  columns,
  tableActionButtons,
}: Props) => {
  const { setExtpipe } = useSelectedExtpipe();
  const project = getProject();
  const history = useHistory();

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

  const dataSource = useMemo(() => {
    return extpipes;
  }, [extpipes]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
    preGlobalFilteredRows,
  } = useTable<Extpipe>(
    {
      columns: headerCols,
      data: dataSource,
      autoResetFilters: false,
      autoResetGlobalFilter: false,
      autoResetSortBy: false,
      autoResetSelectedRows: false,
      stateReducer: selectReducer as any,
      //@ts-ignore
      filterTypes,
      initialState: {
        hiddenColumns: ['externalId'],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect
  );

  return (
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
          {rows.map((row: Row<Extpipe>) => {
            prepareRow(row);
            const handleClickOnRow = () => {
              row.toggleRowSelected(true);
              setExtpipe(row.original);
            };
            return (
              <tr
                {...row.getRowProps()}
                className={`cogs-table-row extpipes-table-row ${
                  row.isSelected ? 'row-active' : ''
                }`}
                onClick={handleClickOnRow}
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
    </StyledExtpipesTable>
  );
};

const TableTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledExtpipesTable = styled(StyledTable)`
  ${Span3};
  margin: 1rem 2rem;

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
