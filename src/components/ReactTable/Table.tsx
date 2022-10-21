import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import update from 'immutability-helper';

import {
  Column,
  IdType,
  PluginHook,
  SortingRule,
  useColumnOrder,
  useFlexLayout,
  useResizeColumns,
  useSortBy,
  useTable,
  Row,
} from 'react-table';

import {
  TableContainer,
  ColumnSelectorWrapper,
  StyledTable,
  LoadMoreButtonWrapper,
  Tr,
  ThWrapper,
  Th,
  Td,
  Thead,
  ContainerInside,
  StyledFlex,
  ResizerWrapper,
} from './elements';

import { HTML5Backend } from 'react-dnd-html5-backend';
import { Body } from '@cognite/cogs.js';
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
    useFlexLayout,
    isResizingColumns && useResizeColumns,
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
      autoResetHiddenColumns: false,
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
