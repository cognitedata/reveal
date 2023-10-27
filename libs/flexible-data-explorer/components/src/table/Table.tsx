import React, { useRef } from 'react';

import { EMPTY_OBJECT } from '@fdx/shared/constants/object';
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
} from '@tanstack/react-table';
import has from 'lodash/has';
import noop from 'lodash/noop';
import useLocalStorageState from 'use-local-storage-state';

import { Flex } from '@cognite/cogs.js';

import { SortIcon } from './components';
import {
  TableContainer,
  StyledTable,
  Tr,
  HeaderRow,
  MainRowContainer,
  MainRowSubContainer,
  ThWrapper,
  Th,
  Td,
  Thead,
  ContainerInside,
  ResizerWrapper,
  Tbody,
  MetadataHeaderText,
  TableDataBody,
} from './elements';

// import { getTableColumns } from './columns';
// import { EmptyState } from '../EmpyState';

// import { CopyToClipboardIconButton } from './CopyToClipboardIconButton';

export type TableProps<T extends Record<string, any>> = {
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
  onRowSelection?: OnChangeFn<RowSelectionState>;
  enableCopying?: boolean;
  enableSelection?: boolean;
  // This is to render a sub component inside the row
  renderRowSubComponent?: (row: Row<T>) => React.ReactNode;
  // This is to render an additional row after, depending on the row's value
  renderSubRowComponent?: (row: Row<T>) => React.ReactNode;
  // This is to render a sub component inside a cell of a row
  renderCellSubComponent?: (cell: Cell<T, unknown>) => React.ReactNode;
  onChangeSearchInput?: (value: string) => void;
};

export type TableData = Record<string, any>;

const defaultColumn: Partial<ColumnDef<any, any>> = {
  minSize: 200,
  size: 400,
};

export function Table<T extends TableData>({
  id,
  data,
  // enableCopying = false,
  enableSelection = false,
  columns,
  onRowClick = noop,
  onRowSelection,
  selectedRows = EMPTY_OBJECT,
  // columnSelectionLimit,
  onSort,
  // enableSorting = false,
  manualSorting = true,
  expandedRows,
  // scrollIntoViewRow,
  stickyHeader = true,
  enableColumnResizing = true,
  sorting,
  // isDataLoading,
  // tableHeaders,
  // tableSubHeaders,
  // hiddenColumns,
  // hideColumnToggle,
  getCanRowExpand,
  getSubrowData,
  enableExpanding,
  onRowExpanded,
  renderRowSubComponent,
  renderSubRowComponent,
  // onChangeSearchInput,
  renderCellSubComponent,
}: TableProps<T>) {
  const tbodyRef = useRef<HTMLDivElement>(null);

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

  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>(id, {
      defaultValue: {},
    });

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

  const { getHeaderGroups, getRowModel } = useReactTable<T>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      expanded: expandedRows,
      columnOrder,
      columnSizing,
      rowSelection: selectedRows,
    },
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: onSort,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: onRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: onRowExpanded,
    enableSorting: Boolean(onSort),
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
    debugTable: true,
    // https://github.com/TanStack/table/issues/4289
    // Fixes the weird behavior with the sorting actions on undefined and async data.
    sortDescFirst: false,
  });

  return (
    <TableContainer>
      {/* {tableHeaders || !isEmpty(hiddenColumns) ? (
        <ColumnSelectorWrapper>
          {tableHeaders}
          {!hideColumnToggle && (
            <StyledFlex>
              <p>hi</p>
            </StyledFlex>
          )}
        </ColumnSelectorWrapper>
      ) : null} */}

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
                        // const dataValue = cell.getValue<string>();
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
                              {/* {enableCopying && (
                                <CopyToClipboardIconButton value={dataValue} />
                              )} */}
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
      </ContainerInside>
    </TableContainer>
  );
}
