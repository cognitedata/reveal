import React, { useEffect } from 'react';
import {
  Column,
  IdType,
  PluginHook,
  SortingRule,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';
import { ColumnToggle } from './ColumnToggle';
import { useCellSelection } from './hooks';
import { SortIcon } from './SortIcon';

export interface TableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  isSortingEnabled?: boolean;
  isStickyHeader?: boolean;
  isColumnSelectEnabled?: boolean;
  onSort?: (props: OnSortProps<T>) => void;
  hiddenColumns?: IdType<T>[];
  isKeyboardNavigationEnabled?: boolean;
}

export interface OnSortProps<T> {
  sortBy?: SortingRule<T>[];
}
export type TableData = Record<string, any>;

export function Table<T extends TableData>({
  data,
  columns,
  onSort,
  hiddenColumns = [],
  isColumnSelectEnabled = false,
  isSortingEnabled = false,
  isStickyHeader = false,
  isKeyboardNavigationEnabled = true,
}: TableProps<T>) {
  const plugins = [
    isSortingEnabled && useSortBy,
    isKeyboardNavigationEnabled && useCellSelection,
  ].filter(Boolean) as PluginHook<T>[];
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    allColumns,

    getToggleHideAllColumnsProps,
    state: { sortBy },
    prepareRow,
  } = useTable<T>(
    {
      data,
      columns,
      manualSortBy: Boolean(onSort),
      initialState: {
        hiddenColumns,
      },
    },
    ...plugins
  );

  useEffect(() => {
    if (onSort && sortBy && sortBy.length > 0) {
      onSort({ sortBy });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sortBy)]);

  return (
    <>
      {isColumnSelectEnabled && (
        <Flex justifyContent="flex-end">
          <ColumnToggle<T>
            allColumns={allColumns}
            getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
          />
        </Flex>
      )}
      <StyledTable {...getTableProps()}>
        <Thead isStickyHeader={isStickyHeader}>
          {headerGroups.map(headerGroup => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <Th
                  {...column.getHeaderProps(
                    isSortingEnabled ? column.getSortByToggleProps() : undefined
                  )}
                >
                  <ThWrapper>
                    {column.render('Header')}
                    <SortIcon
                      canSort={column.canSort}
                      isSorted={column.isSorted}
                      isSortedDesc={column.isSortedDesc}
                    />
                  </ThWrapper>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
                  );
                })}
              </Tr>
            );
          })}
        </tbody>
      </StyledTable>
    </>
  );
}

const StyledTable = styled.table`
  color: var(--cogs-text-icon--medium);
  position: relative;

  width: 100%;
`;

const Th = styled.th`
  color: var(--cogs-text-color-secondary);
  font-weight: 500;
  padding: 8px 12px;
`;

const Td = styled.td`
  padding: 8px 12px;
  &[data-selected='true'] {
    background: var(--cogs-surface--interactive--toggled-hover);
  }

  &:focus {
    outline: 2px solid var(--cogs-border--interactive--toggled-default);
    outline-offset: -1px;
  }
`;

const Thead = styled.thead<{ isStickyHeader?: boolean }>`
  position: ${({ isStickyHeader }) => (isStickyHeader ? 'sticky' : 'relative')};
  top: 0;
  z-index: 1;
`;

const Tr = styled.tr`
  color: inherit;
  border-bottom: 1px solid rgb(229, 229, 229);
  background: white;
  &:hover {
    background: #fafafa;
  }

  ${Thead} &:hover {
    background: transparent;
  }
`;

const ThWrapper = styled.div`
  display: flex;
  align-items: center;
`;
