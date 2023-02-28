import isEmpty from 'lodash/isEmpty';
import React, { useEffect, useMemo, useRef } from 'react';
import merge from 'lodash/merge';
import has from 'lodash/has';

import {
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  getExpandedRowModel,
  SortingState,
  OnChangeFn,
  ExpandedState,
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
  Cell,
} from '@tanstack/react-table';
import useLocalStorageState from 'use-local-storage-state';
import { isElementHorizontallyInViewport } from '../../utils/isElementHorizontallyInViewport';
import { ColumnToggle } from './components/ColumnToggle';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

import {
  TableContainer,
  ColumnSelectorWrapper,
  StyledTable,
  LoadMoreButtonWrapper,
  Tr,
  HeaderRow,
  MainRowContainer,
  MainRowSubContainer,
  ThWrapper,
  Th,
  Td,
  Thead,
  ContainerInside,
  StyledFlex,
  ResizerWrapper,
  SubTableWrapper,
  Tbody,
  MetadataHeaderText,
  TableDataBody,
} from './elements';

import { Flex } from '@cognite/cogs.js';

import { SortIcon } from './components/SortIcon';
import { ResourceTableColumns } from './columns';
import { LoadMore, LoadMoreProps } from './components/LoadMore';
import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import noop from 'lodash/noop';

import { CopyToClipboardIconButton } from './CopyToClipboardIconButton';

export type TableProps<T extends Record<string, any>> = LoadMoreProps & {
  id: string;
  query?: string;
  data: T[];
  isDataLoading?: boolean;
  columns: ColumnDef<T>[];
  selectedRows?: Record<string, boolean>;
  expandedRows?: ExpandedState;
  enableSorting?: boolean;
  manualSorting?: boolean;
  stickyHeader?: boolean;
  showLoadButton?: boolean;
  enableExpanding?: boolean;
  tableHeaders?: React.ReactElement;
  tableSubHeaders?: React.ReactElement;
  enableColumnResizing?: boolean;
  hideColumnToggle?: boolean;
  hiddenColumns?: string[];
  scrollIntoViewRow?: string | number; //Scroll into center row when the selectedRows changes
  onSort?: OnChangeFn<SortingState>;
  sorting?: SortingState;
  columnSelectionLimit?: number;
  onRowClick?: (
    row: T,
    evt?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  getCanRowExpand?: (row: Row<T>) => boolean;
  getSubrowData?: (originalRow: T, index: number) => undefined | T[];
  onRowExpanded?: OnChangeFn<ExpandedState>;
  enableCopying?: boolean;
  renderRowSubComponent?: (row: Row<T>) => React.ReactNode;
  renderCellSubComponent?: (cell: Cell<T, unknown>) => React.ReactNode;
};

export type TableData = Record<string, any>;

Table.Columns = ResourceTableColumns;

export function Table<T extends TableData>({
  id,
  data,
  enableCopying = false,
  columns,
  onRowClick = noop,
  columnSelectionLimit,
  onSort,
  enableSorting = false,
  manualSorting = true,
  expandedRows,
  selectedRows,
  scrollIntoViewRow,
  stickyHeader = true,
  enableColumnResizing = true,
  sorting,
  showLoadButton = false,
  hasNextPage,
  isDataLoading,
  isLoadingMore,
  tableHeaders,
  tableSubHeaders,
  fetchMore,
  hiddenColumns,
  hideColumnToggle,
  getCanRowExpand,
  getSubrowData,
  enableExpanding,
  onRowExpanded,
  renderRowSubComponent,
  renderCellSubComponent,
}: TableProps<T>) {
  const defaultColumn: Partial<ColumnDef<T, unknown>> = useMemo(
    () => ({
      minSize: 200,
      size: 400,
      maxSize: 600,
    }),
    []
  );

  const tbodyRef = useRef<HTMLDivElement>(null);
  const trackUsage = useMetrics();

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

  const initialHiddenColumns = useMemo(() => {
    return (hiddenColumns || []).reduce((previousValue, currentValue) => {
      // turns out the spread syntax was causing huge memory consumption.
      // my guess would be that every cycle we create a new object and all of them go to memory.
      previousValue[currentValue] = false;
      return previousValue;
    }, {} as Record<string, boolean>);
  }, [hiddenColumns]);

  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>(id, {
      defaultValue: {},
    });

  /**
   * The initialHiddenColumns are updated multiple times when the metadata columns are fetched.
   * We need to listen to those changes and update the initial state properly
   * */
  useEffect(() => {
    setColumnVisibility(merge(initialHiddenColumns, columnVisibility));
  }, [initialHiddenColumns]);

  const [columnOrder, setColumnOrder] = useLocalStorageState<ColumnOrderState>(
    `${id}-column-order`,
    { defaultValue: [] }
  );
  const [columnSizing, setColumnSizing] =
    useLocalStorageState<ColumnSizingState>(`${id}-column-sizing`, {
      defaultValue: {},
    });

  const getRowId = React.useCallback(
    (originalRow: T, index: number, parent?: Row<T>) => {
      return (
        originalRow.id ||
        originalRow.key ||
        (parent ? [parent.id, index].join('.') : index)
      );
    },
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    getAllLeafColumns,
    getIsSomeColumnsVisible,
  } = useReactTable<T>({
    data,
    columns: columns,
    state: {
      sorting,
      columnVisibility,
      expanded: expandedRows,
      columnOrder,
      columnSizing,
      rowSelection: selectedRows || {},
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: onSort,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: onRowExpanded,
    enableSorting: enableSorting,
    manualSorting: manualSorting,
    columnResizeMode: 'onChange',
    enableHiding: true,
    enableExpanding: enableExpanding,
    defaultColumn: defaultColumn,
    getRowCanExpand: getCanRowExpand,
    getSubRows: getSubrowData,
    getRowId: getRowId,
    autoResetExpanded: false,
    enableSortingRemoval: true,
    // https://github.com/TanStack/table/issues/4289
    // Fixes the weird behavior with the sorting actions on undefined and async data.
    sortDescFirst: false,
  });

  useEffect(() => {
    if (scrollIntoViewRow) {
      const rowElement = document.querySelector(
        `[id="${id}"] [id="${scrollIntoViewRow}"]`
      );
      if (rowElement && !isElementHorizontallyInViewport(rowElement)) {
        rowElement.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        });
      }
    }
  }, [id, scrollIntoViewRow]);

  const handleToggleAllVisibility = (visible: boolean) => {
    setColumnVisibility(
      getAllLeafColumns().reduce((previousValue, currentValue) => {
        if (currentValue.getCanHide()) {
          return { ...previousValue, [currentValue.id]: visible };
        }
        return previousValue;
      }, {})
    );
  };

  const handleClickLoadMore = () => {
    if (!fetchMore) return;
    fetchMore();
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.LOAD_MORE, {
      table: id,
    });
  };

  const handleResetSelectedColumns = () => {
    setColumnVisibility(initialHiddenColumns);
  };

  const loadMoreProps = { isLoadingMore, hasNextPage, fetchMore };

  const renderTableContent = () => {
    if (isDataLoading) {
      return <EmptyState isLoading title="Loading results" />;
    }

    if (!data || data.length === 0) {
      return <EmptyState body="Please, refine your filters" />;
    }
    if (!getIsSomeColumnsVisible()) {
      return <EmptyState body="Please, select your columns" />;
    }

    return (
      <ContainerInside>
        <StyledTable id={id} key={id} className="data-exploration-table">
          <Thead isStickyHeader={stickyHeader}>
            {getHeaderGroups().map((headerGroup) => (
              <HeaderRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    <ThWrapper>
                      <Flex direction="column" gap={2}>
                        {has(header.column.columnDef?.meta, 'isMetadata') && (
                          <MetadataHeaderText>Metadata</MetadataHeaderText>
                        )}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Flex>
                      <SortIcon
                        canSort={header.column.getCanSort()}
                        isSorted={header.column.getIsSorted()}
                        onClick={() => {
                          header.column.toggleSorting();

                          trackUsage(
                            DATA_EXPLORATION_COMPONENT.CLICK.SORT_COLUMN,
                            {
                              table: id,
                              column: header.column.id,
                              sortIndex: header.column.getSortIndex(),
                            }
                          );
                        }}
                      />
                      {enableColumnResizing ? (
                        <ResizerWrapper
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `resizer ${
                              header.column.getIsResizing() ? 'isResizing' : ''
                            }`,
                          }}
                        />
                      ) : null}
                    </ThWrapper>
                  </Th>
                ))}
              </HeaderRow>
            ))}
          </Thead>
          <Tbody ref={tbodyRef}>
            {getRowModel().rows.map((row) => {
              return (
                <React.Fragment key={row.id}>
                  <Tr
                    key={row.id}
                    id={row.id}
                    tabIndex={0}
                    onClick={(evt) => onRowClick(row.original, evt)}
                    onKeyDown={(evt) => handleKeyDown(evt, row)}
                    className={row.getIsSelected() ? 'selected' : ''}
                  >
                    <MainRowContainer>
                      {row.getVisibleCells().map((cell) => {
                        const dataValue = cell.getValue<string>();
                        return (
                          <Td
                            {...{
                              key: cell.id,
                              style: {
                                width: cell.column.getSize(),
                              },
                            }}
                          >
                            <TableDataBody level={3}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                              {enableCopying && (
                                <CopyToClipboardIconButton value={dataValue} />
                              )}
                            </TableDataBody>
                            {renderCellSubComponent &&
                              renderCellSubComponent(cell)}
                          </Td>
                        );
                      })}
                    </MainRowContainer>
                    {renderRowSubComponent && (
                      <MainRowSubContainer>
                        {renderRowSubComponent(row)}
                      </MainRowSubContainer>
                    )}
                  </Tr>
                </React.Fragment>
              );
            })}
          </Tbody>
        </StyledTable>
        {showLoadButton && (
          <LoadMoreButtonWrapper justifyContent="center" alignItems="center">
            <LoadMore {...loadMoreProps} fetchMore={handleClickLoadMore} />
          </LoadMoreButtonWrapper>
        )}
      </ContainerInside>
    );
  };

  return (
    <TableContainer>
      {tableHeaders || !isEmpty(hiddenColumns) ? (
        <ColumnSelectorWrapper>
          {tableHeaders}
          {!hideColumnToggle && (
            <StyledFlex>
              <ColumnToggle<T>
                columnSelectionLimit={columnSelectionLimit}
                onColumnOrderChanged={setColumnOrder}
                allColumns={getAllLeafColumns}
                onResetSelectedColumns={handleResetSelectedColumns}
              />
            </StyledFlex>
          )}
        </ColumnSelectorWrapper>
      ) : null}

      {tableSubHeaders && <SubTableWrapper>{tableSubHeaders}</SubTableWrapper>}

      {renderTableContent()}
    </TableContainer>
  );
}
