import React, { useEffect } from 'react';
import {
  Column,
  IdType,
  PluginHook,
  SortingRule,
  useFlexLayout,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';
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
}
export interface OnSortProps<T> {
  sortBy?: SortingRule<T>[];
}

export type TableData = Record<string, any>;

NewTable.Columns = ResourceTableColumns;

const defaultColumn = {
  // When using the useFlexLayout:
  minWidth: 30, // minWidth is only used as a limit for resizing
  width: 150, // width is used for both the flex-basis and flex-grow
  maxWidth: 200, // maxWidth is only used as a limit for resizing
};

export function NewTable<T extends TableData>({
  data,
  columns,
  onRowClick = () => {},
  onSort,
  visibleColumns = [],

  isSortingEnabled = false,
  isStickyHeader = false,
  isKeyboardNavigationEnabled = true,
  showLoadButton = false,
  hasNextPage,
  isLoadingMore,
  fetchMore,
}: TableProps<T>) {
  const plugins = [
    isSortingEnabled && useSortBy,
    isKeyboardNavigationEnabled && useCellSelection,
    useFlexLayout,
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
    state: { sortBy },
    prepareRow,
  } = useTable<T>(
    {
      data,
      columns,
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

  const loadMoreProps = { isLoadingMore, hasNextPage, fetchMore };

  return (
    <TableContainer>
      {hiddenColumns.length > 0 && (
        <ColumnSelectorWrapper>
          <Flex justifyContent="flex-end">
            <ColumnToggle<T>
              allColumns={allColumns}
              getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
            />
          </Flex>
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
