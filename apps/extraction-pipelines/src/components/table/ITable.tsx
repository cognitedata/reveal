import React, { ReactText, useMemo } from 'react';
import {
  useTable,
  useSortBy,
  useRowSelect,
  Hooks,
  Cell,
  TableOptions,
  TableState,
  ActionType,
  HeaderGroup,
  Row,
  ColumnInstance,
  useGlobalFilter,
  Column,
} from 'react-table';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { matchSorter } from 'match-sorter';
import IntegrationsRadio from './IntegrationsRadio';
import IntegrationTableSearch from './IntegrationTableSearch';

const SortingIcon = styled((props) => <Icon {...props} />)`
  margin-left: 0.25rem;
  vertical-align: middle;
  path {
    fill: ${Colors['greyscale-grey6'].hex()};
  }
`;

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

interface ITableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
}
function fuzzyTextFilterFn<T extends { values: any }>(
  rows: ReadonlyArray<T>,
  id: string,
  filterValue: any
) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}
fuzzyTextFilterFn.autoRemove = (val: boolean) => !val;

function ITable<T extends { id: ReactText }>({
  data,
  columns,
}: ITableProps<T>) {
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
    state,
    setGlobalFilter,
    preGlobalFilteredRows,
  } = useTable(
    {
      columns: headerCols,
      data: dataSource,
      autoResetSelectedRows: false,
      stateReducer: selectReducer,
      filterTypes,
    } as TableOptions<T>,
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks: Hooks<T>) => {
      hooks.visibleColumns.push((allColumns: ColumnInstance<T>[]) => [
        {
          id: 'selection',
          Header: () => <div />,
          disableSortBy: true,
          Cell: ({ row }: Cell<T>) => {
            return (
              <div>
                <IntegrationsRadio
                  inputId={`radio-row-${row.id}`}
                  {...row.getToggleRowSelectedProps()}
                />
              </div>
            );
          },
        },
        ...allColumns,
      ]);
    }
  );
  return (
    <>
      <IntegrationTableSearch
        globalFilter={state.globalFilter}
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
      />
      <table {...getTableProps()} className="cogs-table integrations-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<T>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<T>) => {
                const showSorterIndicator = (sCol: HeaderGroup<T>) => {
                  if (!sCol.disableSortBy) {
                    if (sCol.isSorted) {
                      if (sCol.isSortedDesc) {
                        return <SortingIcon type="SortDown" />;
                      }
                      return <SortingIcon type="SortUp" />;
                    }
                    return <SortingIcon type="OrderDesc" />;
                  }
                  return '';
                };
                return (
                  <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}
                    {showSorterIndicator(col)}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row: Row<T>) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`cogs-table-row integrations-table-row ${
                  row.isSelected ? 'row-active' : ''
                }`}
              >
                {row.cells.map((cell: Cell<T>) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
export default ITable;
