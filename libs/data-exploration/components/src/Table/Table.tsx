import React, { useEffect, useMemo, useRef } from 'react';

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
  RowSelectionState,
  Updater,
} from '@tanstack/react-table';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import useLocalStorageState from 'use-local-storage-state';

import { Checkbox, Flex } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  EMPTY_OBJECT,
  getResourceTypeById,
  LOADING_RESULTS,
  REFINE_FILTERS_OR_UPDATE_SEARCH,
  isElementHorizontallyInViewport,
  ResourceItem,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';

import { EmptyState } from '../EmpyState';

import {
  ColumnToggle,
  SortIcon,
  LoadMore,
  LoadMoreProps,
  CopyToClipboardIconButton,
} from './components';
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

export type TableProps<T extends Record<string, any>> = LoadMoreProps & {
  id: string;
  columns: ColumnDef<T>[];
  selectedRows?:
    | Record<string | number, boolean>
    | Record<string, ResourceItem>;
  data: T[];
  query?: string;
  isDataLoading?: boolean;
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
  onRowSelection?: (
    updater: Updater<RowSelectionState>,
    data: ResourceItem[]
  ) => void;
  enableCopying?: boolean;
  enableSelection?: boolean;
  // This is to render a subcomponent inside the row
  renderRowSubComponent?: (row: Row<T>) => React.ReactNode;
  // This is to render an additional row after, depending on the row's value
  renderSubRowComponent?: (row: Row<T>) => React.ReactNode;
  // This is to render a subcomponent inside a cell of a row
  renderCellSubComponent?: (cell: Cell<T, unknown>) => React.ReactNode;
  onChangeSearchInput?: (value: string) => void;
};

export type TableData = Record<string, any>;

export function Table<T extends TableData>({
  id,
  columns,
  data,
  enableCopying = false,
  enableSelection = false,
  onRowClick = noop,
  onRowSelection,
  selectedRows = EMPTY_OBJECT,
  columnSelectionLimit,
  onSort,
  enableSorting = false,
  manualSorting = true,
  expandedRows,
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
  renderSubRowComponent,
  renderCellSubComponent,
  onChangeSearchInput,
}: TableProps<T>) {
  const { t } = useTranslation();

  const defaultColumn: Partial<ColumnDef<T, unknown>> = useMemo(
    () => ({
      minSize: 200,
      size: 400,
    }),
    []
  );

  const checkboxColumn: ColumnDef<T> = {
    id: 'select',
    enableResizing: false,
    maxSize: 50,
    header: ({ table }) => {
      return (
        <Checkbox
          {...{
            checked:
              table.getIsAllRowsSelected() || table.getIsSomeRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      );
    },
    cell: ({ row }) => {
      return (
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            onClick: (event: React.MouseEvent<HTMLInputElement>) => {
              event.stopPropagation();
            },
          }}
        />
      );
    },
  };

  const updatedColumns = useMemo(() => {
    return enableSelection ? [checkboxColumn, ...columns] : columns;
  }, [columns, enableSelection]);

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
          (currentRow?.previousElementSibling as HTMLElement)?.focus();
          break;
        case 'ArrowDown':
          (currentRow?.nextElementSibling as HTMLElement)?.focus();
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
    [enableSelection]
  );

  const {
    getHeaderGroups,
    getRowModel,
    getAllLeafColumns,
    getIsSomeColumnsVisible,
  } = useReactTable<T>({
    data,
    columns: updatedColumns,
    state: {
      sorting,
      columnVisibility,
      expanded: expandedRows,
      columnOrder,
      columnSizing,
      columnPinning: {
        left: ['select'],
      },
      rowSelection: selectedRows
        ? mapValues(selectedRows, function (value) {
            return Boolean(value);
          })
        : undefined,
    },
    enableRowSelection: enableSelection,
    enablePinning: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: onSort,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: onRowSelection
      ? (updater) =>
          onRowSelection(
            updater,
            data.map((item) => ({
              id: item.id,
              externalId: item.externalId,
              type: getResourceTypeById(id),
            }))
          )
      : undefined,
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
      return (
        <EmptyState isLoading title={t('LOADING_RESULTS', LOADING_RESULTS)} />
      );
    }

    if (!data || data.length === 0) {
      return (
        <EmptyState
          body={t(
            'REFINE_FILTERS_OR_UPDATE_SEARCH',
            REFINE_FILTERS_OR_UPDATE_SEARCH
          )}
        />
      );
    }
    if (!getIsSomeColumnsVisible()) {
      return (
        <EmptyState body={t('SELECT_COLUMNS', 'Please, select your columns')} />
      );
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
                      className:
                        header.column.id === 'select' ? 'sticky-column' : '',
                    }}
                  >
                    <ThWrapper>
                      <Flex direction="column" gap={2}>
                        {has(header.column.columnDef?.meta, 'isMetadata') && (
                          <MetadataHeaderText>
                            {t('METADATA', 'Metadata')}
                          </MetadataHeaderText>
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

                      {enableColumnResizing && header.id !== 'select' ? (
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
                    data-testid="table-row"
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
                              className:
                                cell.column.columnDef.id === 'select'
                                  ? 'sticky-column'
                                  : '',
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
                  {renderSubRowComponent && renderSubRowComponent(row)}
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
    <TableContainer data-testid={id}>
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
                onChangeSearchInput={onChangeSearchInput}
              />
            </StyledFlex>
          )}
        </ColumnSelectorWrapper>
      ) : null}

      {tableSubHeaders && (
        <SubTableWrapper data-testid="sub-table-wrapper">
          {tableSubHeaders}
        </SubTableWrapper>
      )}

      {renderTableContent()}
    </TableContainer>
  );
}
