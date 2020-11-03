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
  Column,
} from 'react-table';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import IntegrationsRadio from './IntegrationsRadio';

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
  columns: ReadonlyArray<Column<T>>;
}

function ITable<T extends { id: ReactText }>({
  data,
  columns,
}: ITableProps<T>) {
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
      autoResetSelectedRows: false,
      stateReducer: selectReducer,
    } as TableOptions<T>,
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
