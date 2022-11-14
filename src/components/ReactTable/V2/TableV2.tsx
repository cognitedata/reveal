import update from 'immutability-helper';
import isEmpty from 'lodash/isEmpty';
import React, { useCallback, useMemo, useRef } from 'react';

import {
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { DASH, useLocalStorageState } from '../../../utils';
import { ColumnToggle } from './ColumnToggle';

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
} from '../elements';

import { HTML5Backend } from 'react-dnd-html5-backend';
import { Body } from '@cognite/cogs.js';
import { DndProvider } from 'react-dnd';

import { SortIcon } from './SortIcon';
import { ResourceTableColumns } from './columns';
import { LoadMore, LoadMoreProps } from '../LoadMore';
import { EmptyState } from 'components/EmpyState/EmptyState';

export interface TableProps<T extends Record<string, any>>
  extends LoadMoreProps {
  id: string;
  data: T[];
  columns: ColumnDef<T>[];
  enableSorting?: boolean;
  stickyHeader?: boolean;
  showLoadButton?: boolean;
  tableHeaders?: React.ReactElement;
  tableSubHeaders?: React.ReactElement;
  enableColumnResizing?: boolean;
  hideColumnToggle?: boolean;
  hiddenColumns?: string[];
  onSort?: OnChangeFn<SortingState>;
  sorting?: SortingState;
  onRowClick?: (
    row: T,
    evt?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
}

export type TableData = Record<string, any>;

TableV2.Columns = ResourceTableColumns;

export function TableV2<T extends TableData>({
  data,
  columns,
  onRowClick = () => {},
  onSort,
  enableSorting = false,
  stickyHeader = true,
  enableColumnResizing = true,
  sorting,
  showLoadButton = false,
  hasNextPage,
  isLoadingMore,
  tableHeaders,
  tableSubHeaders,
  fetchMore,
  id,
  hiddenColumns,
  hideColumnToggle,
}: TableProps<T>) {
  const defaultColumn: Partial<ColumnDef<T, unknown>> = useMemo(
    () => ({
      minSize: 200,
      size: 400,
    }),
    []
  );

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

  const [columnVisibility, setColumnVisibility] = useLocalStorageState(
    id,
    (hiddenColumns || []).reduce((previousValue, currentValue) => {
      return {
        ...previousValue,
        [currentValue]: false,
      };
    }, {})
  );

  const { getHeaderGroups, getRowModel, getAllLeafColumns, setColumnOrder } =
    useReactTable<T>({
      data,
      columns: columns,
      state: {
        sorting,
        columnVisibility,
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: onSort,
      onColumnVisibilityChange: setColumnVisibility,
      enableSorting: enableSorting,
      manualSorting: !!onSort,
      columnResizeMode: 'onChange',
      enableHiding: true,
      defaultColumn: defaultColumn,
      enableSortingRemoval: true,
    });

  // TODO: replace the drag library with a better one, we should update the order on dropEnd, not while ordering
  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const allCards = [...getAllLeafColumns()];

      const newCards = update(allCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, allCards[dragIndex]],
        ],
      });

      setColumnOrder(newCards.map(bla => bla.id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );

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
  const loadMoreProps = { isLoadingMore, hasNextPage, fetchMore };

  return (
    <TableContainer>
      {tableHeaders || !isEmpty(hiddenColumns) ? (
        <ColumnSelectorWrapper>
          {tableHeaders}
          {!hideColumnToggle && (
            <DndProvider backend={HTML5Backend}>
              <StyledFlex>
                <ColumnToggle<T>
                  moveCard={moveCard}
                  allColumns={getAllLeafColumns()}
                  toggleAllColumnsVisible={handleToggleAllVisibility}
                />
              </StyledFlex>
            </DndProvider>
          )}
        </ColumnSelectorWrapper>
      ) : null}

      {tableSubHeaders && tableSubHeaders}

      {!data || data.length === 0 ? (
        <EmptyState body="Please, refine your filters" />
      ) : (
        <ContainerInside>
          <StyledTable className="data-exploration-table">
            <Thead isStickyHeader={stickyHeader}>
              {getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                                header.column.getIsResizing()
                                  ? 'isResizing'
                                  : ''
                              }`,
                            }}
                          />
                        ) : null}
                      </ThWrapper>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <div ref={tbodyRef}>
              {getRowModel().rows.map(row => {
                return (
                  <Tr
                    key={row.id}
                    id={row.id}
                    tabIndex={0}
                    onClick={evt => onRowClick(row.original, evt)}
                    onKeyDown={evt => handleKeyDown(evt, row)}
                  >
                    {row.getVisibleCells().map(cell => {
                      return (
                        <Td
                          {...{
                            key: cell.id,
                            style: {
                              width: cell.column.getSize(),
                            },
                          }}
                        >
                          <Body level={2}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            ) || DASH}
                          </Body>
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
