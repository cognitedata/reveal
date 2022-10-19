import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
  Row,
} from 'react-table';
import styled from 'styled-components';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Body, Flex } from '@cognite/cogs.js';
import { DndProvider } from 'react-dnd';

import { ColumnToggle } from './ColumnToggle';

import { SortIcon } from './SortIcon';
import { ResourceTableColumns } from './columns';
import { LoadMore, LoadMoreProps } from './LoadMore';
// import { useLocalStorageState } from 'utils';
import { EmptyState } from 'components/EmpyState/EmptyState';

export interface TableProps<T extends Record<string, any>>
  extends LoadMoreProps {
  data: T[];
  columns: Column<T>[];
  isSortingEnabled?: boolean;
  isStickyHeader?: boolean;

  onSort?: (props: OnSortProps<T>) => void;
  visibleColumns?: IdType<T>[];
  onRowClick?: (
    row: T,
    evt?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  showLoadButton?: boolean;
  alwaysColumnVisible?: string;
  tableHeaders?: React.ReactElement;
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
  isStickyHeader = true,
  isResizingColumns = true,
  showLoadButton = false,
  hasNextPage,
  isLoadingMore,
  tableHeaders,
  fetchMore,
  alwaysColumnVisible,
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

    useColumnOrder,
    !isResizingColumns && useFlexLayout,
    isResizingColumns && useResizeColumns,
    isResizingColumns && useBlockLayout,
  ].filter(Boolean) as PluginHook<T>[];

  const tbodyRef = useRef<HTMLDivElement>(null);

  const allFields = columns.map(col => col.accessor || col.id || '');

  // To add the navigation in the row
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    row: Row<T>
  ) => {
    event.stopPropagation();
    if (tbodyRef.current) {
      const currentRow = tbodyRef.current?.children.namedItem(row.id);

      switch (event.key) {
        case 'ArrowUp':
          // @ts-ignore
          currentRow?.previousElementSibling?.focus();
          break;
        case 'ArrowDown':
          // @ts-ignore
          currentRow?.nextElementSibling?.focus();
          break;
        case 'Enter':
          onRowClick(row.original);
          break;
        default:
          break;
      }
    }
  };

  const hiddenColumns = useMemo(() => {
    return visibleColumns.length === 0
      ? []
      : (allFields.filter(
          col => !visibleColumns.some(visibleColumn => visibleColumn === col)
        ) as IdType<T>[]);
  }, [allFields, visibleColumns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    allColumns,
    getToggleHideAllColumnsProps,
    setHiddenColumns,
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
      {tableHeaders || hiddenColumns.length > 0 ? (
        <ColumnSelectorWrapper>
          {tableHeaders}
          {hiddenColumns.length > 0 && (
            <DndProvider backend={HTML5Backend}>
              <StyledFlex>
                <ColumnToggle<T>
                  alwaysColumnVisible={alwaysColumnVisible}
                  setHiddenColumns={setHiddenColumns}
                  moveCard={moveCard}
                  allColumns={allColumns}
                  getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
                />
              </StyledFlex>
            </DndProvider>
          )}
        </ColumnSelectorWrapper>
      ) : null}

      {!data || data.length === 0 ? (
        <EmptyState body="Please, refine your filters" />
      ) : (
        <ContainerInside>
          <StyledTable {...getTableProps()}>
            <Thead isStickyHeader={isStickyHeader}>
              {headerGroups.map(headerGroup => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <Th
                      {...column.getHeaderProps(
                        isSortingEnabled
                          ? column.getSortByToggleProps()
                          : undefined
                      )}
                    >
                      <ThWrapper
                        className={`resizer ${
                          column.isResizing ? 'isResizing' : ''
                        }`}
                      >
                        {column.render('Header')}
                        <SortIcon
                          canSort={column.canSort}
                          isSorted={column.isSorted}
                          isSortedDesc={column.isSortedDesc}
                        />
                        {isResizingColumns ? (
                          <ResizerWrapper
                            {...column.getResizerProps()}
                            className={`${
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
            <div {...getTableBodyProps()} ref={tbodyRef}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <Tr
                    {...row.getRowProps()}
                    id={row.id}
                    tabIndex={0}
                    onClick={evt => onRowClick(row.original, evt)}
                    onKeyDown={evt => handleKeyDown(evt, row)}
                  >
                    {row.cells.map(cell => {
                      return (
                        <Td {...cell.getCellProps()}>
                          <Body level={2}>{cell.render('Cell') || '–'}</Body>
                        </Td>
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
        </ContainerInside>
      )}
    </TableContainer>
  );
}

const ContainerInside = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const ColumnSelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 10px;
`;

const StyledTable = styled.div`
  color: var(--cogs-text-icon--medium);
  position: relative;
  width: 100%;

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

  touch-action: none;

  &:hover {
    border-right: 2px solid rgba(0, 0, 0, 0.1);
  }
  &.isResizing {
    border-right: 2px solid rgba(0, 0, 0, 0.3);
  }
`;

const Th = styled.div`
  color: var(--cogs-text-color-secondary);
  font-weight: 500;
  padding: 8px 12px;
`;

const StyledFlex = styled.div`
  margin-left: auto;
`;

const Thead = styled.div<{ isStickyHeader?: boolean }>`
  position: ${({ isStickyHeader }) => (isStickyHeader ? 'sticky' : 'relative')};
  top: 0;
  background: white;
  z-index: 1;
`;

const Tr = styled.div`
  color: inherit;
  border-bottom: 1px solid var(--cogs-border--muted);
  display: flex;
  align-items: center;
  height: 100%;

  background: white;

  min-height: 42px;

  &:hover {
    background: var(--cogs-surface--medium);
    cursor: pointer;
  }

  &[data-selected='true'] {
    background: var(--cogs-surface--interactive--toggled-hover);
  }

  &:focus {
    outline: none;
    background-color: var(--cogs-surface--interactive--toggled-pressed);
  }

  ${Thead} &:hover {
    background: transparent;
    cursor: unset;
  }
`;
const Td = styled.div`
  word-wrap: break-word;
  padding: 8px 12px;
  font-size: 14px;
`;

const ThWrapper = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--cogs-text-icon--strong);
  gap: 10px;

  &:hover > ${ResizerWrapper} {
    border-right: 2px solid rgba(0, 0, 0, 0.1);
  }
`;

const LoadMoreButtonWrapper = styled(Flex)`
  margin: 20px 0;
`;
