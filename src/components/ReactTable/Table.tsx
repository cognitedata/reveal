import React, { useCallback, useEffect, useMemo } from 'react';
import update from 'immutability-helper';

import {
  Column,
  IdType,
  PluginHook,
  SortingRule,
  useColumnOrder,
  useBlockLayout,
  useFlexLayout,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Flex } from '@cognite/cogs.js';
import { DndProvider } from 'react-dnd';

import { ColumnToggle } from './ColumnToggle';
import { useCellSelection } from './hooks';
import { SortIcon } from './SortIcon';
import { ResourceTableColumns } from './columns';
import { LoadMore, LoadMoreProps } from './LoadMore';

export interface TableProps<T extends Record<string, any>>
  extends LoadMoreProps {
  data: T[];
  columns: Column<T>[];
  isSortingEnabled?: boolean;
  isStickyHeader?: boolean;

  onSort?: (props: OnSortProps<T>) => void;
  visibleColumns?: IdType<T>[];
  isKeyboardNavigationEnabled?: boolean;
  onRowClick?: (
    row?: T,
    evt?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  showLoadButton?: boolean;
  isResizingColumns?: boolean;
}
export interface OnSortProps<T> {
  sortBy?: SortingRule<T>[];
}

export type TableData = Record<string, any>;

NewTable.Columns = ResourceTableColumns;

export function NewTable<T extends TableData>({
  data,
  columns,
  onRowClick = () => {},
  onSort,
  visibleColumns = [],

  isSortingEnabled = false,
  isStickyHeader = false,
  isKeyboardNavigationEnabled = true,
  isResizingColumns = false,
  showLoadButton = false,
  hasNextPage,
  isLoadingMore,
  fetchMore,
}: TableProps<T>) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 100,
      width: 200,
      maxWidth: 400,
    }),
    []
  );
  const plugins = [
    isSortingEnabled && useSortBy,
    isKeyboardNavigationEnabled && useCellSelection,
    useColumnOrder,
    !isResizingColumns && useFlexLayout,
    isResizingColumns && useResizeColumns,
    isResizingColumns && useBlockLayout,
  ].filter(Boolean) as PluginHook<T>[];

  const allFields = columns.map(col => col.accessor || col.id || '');

  const hiddenColumns =
    visibleColumns.length === 0
      ? []
      : (allFields.filter(
          col => !visibleColumns.some(visibleColumn => visibleColumn === col)
        ) as IdType<T>[]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    allColumns,

    getToggleHideAllColumnsProps,
    setColumnOrder,

    state: { sortBy },
    prepareRow,
  } = useTable<T>(
    {
      data,
      columns: columns,
      manualSortBy: Boolean(onSort),
      defaultColumn,

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

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const allCards = [...allColumns];

      const newCards = update(allCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, allCards[dragIndex]],
        ],
      });

      setColumnOrder(newCards.map(bla => bla.id));
    },
    [allColumns, setColumnOrder]
  );

  const loadMoreProps = { isLoadingMore, hasNextPage, fetchMore };

  return (
    <TableContainer>
      {hiddenColumns.length > 0 && (
        <ColumnSelectorWrapper>
          <DndProvider backend={HTML5Backend}>
            <Flex justifyContent="flex-end">
              <ColumnToggle<T>
                moveCard={moveCard}
                allColumns={allColumns}
                getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
              />
            </Flex>
          </DndProvider>
        </ColumnSelectorWrapper>
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
                    {isResizingColumns ? (
                      <ResizerWrapper
                        {...column.getResizerProps()}
                        className={`resizer ${
                          column.isResizing ? 'isResizing' : ''
                        }`}
                      />
                    ) : null}
                  </ThWrapper>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <div {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <Tr
                {...row.getRowProps()}
                onClick={evt => onRowClick(row.original, evt)}
                onKeyDown={evt => {
                  if (evt.key === 'Enter') {
                    onRowClick(row.original);
                  }
                }}
              >
                {row.cells.map(cell => {
                  return (
                    <Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
                  );
                })}
              </Tr>
            );
          })}
        </div>
      </StyledTable>
      {showLoadButton && (
        <LoadMoreButtonWrapper justifyContent="center" alignItems="center">
          <LoadMore {...loadMoreProps} />
        </LoadMoreButtonWrapper>
      )}
    </TableContainer>
  );
}

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ColumnSelectorWrapper = styled.div`
  width: 100%;
`;

const StyledTable = styled.div`
  color: var(--cogs-text-icon--medium);
  position: relative;
  width: 100%;
  overflow: auto;

  & > div {
    min-width: 100%;
    width: fit-content;
  }
`;

const ResizerWrapper = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  display: inline-block;
  width: 10px;
  height: 100%;
  border-right: 2px solid rgba(0, 0, 0, 0.1);
  touch-action: none;

  &.isResizing {
    border-right: 2px solid rgba(0, 0, 0, 0.3);
  }
`;

const Th = styled.div`
  color: var(--cogs-text-color-secondary);
  font-weight: 500;
  padding: 8px 12px;
`;

const Td = styled.div`
  padding: 8px 12px;
  word-wrap: break-word;
  &[data-selected='true'] {
    background: var(--cogs-surface--interactive--toggled-hover);
  }

  &:focus {
    outline: 2px solid var(--cogs-border--interactive--toggled-default);
    outline-offset: -1px;
  }
`;

const Thead = styled.div<{ isStickyHeader?: boolean }>`
  position: ${({ isStickyHeader }) => (isStickyHeader ? 'sticky' : 'relative')};
  top: 0;
  z-index: 1;
`;

const Tr = styled.div`
  color: inherit;
  border-bottom: 1px solid var(--cogs-border--muted);
  background: white;
  &:hover {
    background: var(--cogs-surface--medium);
    cursor: pointer;
  }

  ${Thead} &:hover {
    background: transparent;
  }
`;

const ThWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LoadMoreButtonWrapper = styled(Flex)`
  margin-top: 20px;
`;
