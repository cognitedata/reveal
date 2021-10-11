// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useTable,
  useSortBy,
  useRowSelect,
  TableOptions,
  // UseTableRowProps,
  useFlexLayout,
  usePagination,
  HeaderGroup,
} from 'react-table';

import { TS_FIX_ME } from 'core';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { alphanumeric } from '_helpers/sort';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { SortBy } from 'pages/types';
import { MarginRightSmallContainer } from 'styles/layout';
import useTheme from 'styles/useTheme';

import {
  TableWrap,
  TableRow,
  TableHead,
  RowHoverHeader,
  CellContent,
  EndPaginationText,
  Footer,
  Thead,
  Scrollbars,
  LoadMoreButton,
} from './elements';
import { selectionHook, expansionHook } from './hooks';
import { TableColumnSortIcons } from './TableColumnSortIcons';
import { CustomRow } from './TableRow';
import { TableResults, Options } from './types';

export type HandleRowClick = (rowInformation: any) => void;
export type HandleRowMouseEnter = (rowInformation: any) => void;
export type HandleRowMouseLeave = (rowInformation: any) => void;
export type HandleSort = (sortBy: SortBy[]) => void;

// export interface TableRowProps<T extends Object> extends UseTableRowProps<T> {}

type ExpandedIds = TableResults;
type SelectedIds = TableResults;
type IndeterminateIds = TableResults;

export type RenderRowSubComponent = ({ row }: any) => React.ReactNode;

// eslint-disable-next-line @typescript-eslint/ban-types
interface Props<T extends Object> extends TableOptions<T> {
  scrollTable?: boolean;
  id: string;
  data: T[];
  columns: any[];
  options?: Options;
  handleRowClick?: HandleRowClick;
  handleDoubleClick?: HandleRowClick;
  handleMouseEnter?: HandleRowMouseEnter;
  handleMouseLeave?: HandleRowMouseLeave;
  handleRowSelect?: (item: T, value: boolean) => void; // checkbox
  handleRowsSelect?: (value: boolean) => void;
  checkIfCheckboxEnabled?: (row: T) => boolean;
  handleSort?: HandleSort;
  selectedIds?: SelectedIds;
  expandedIds?: ExpandedIds;
  indeterminateIds?: IndeterminateIds;
  renderChildren?: ({ selected }: { selected: T[] }) => React.ReactNode;
  renderRowSubComponent?: RenderRowSubComponent;
  disabledRowClickCells?: string[];
  renderRowHoverComponent?: RenderRowSubComponent;
}
// eslint-disable-next-line @typescript-eslint/ban-types
const TableInner = <T extends Object>({
  scrollTable,
  id,
  data,
  columns,
  handleRowClick,
  handleMouseEnter,
  handleMouseLeave,
  handleDoubleClick,
  handleRowSelect,
  handleRowsSelect,
  renderChildren,
  renderRowSubComponent,
  renderRowHoverComponent,
  checkIfCheckboxEnabled,
  handleSort,
  options = {},
  selectedIds,
  expandedIds = {},
  indeterminateIds = {},
  disabledRowClickCells = [],
}: React.PropsWithChildren<Props<T>>) => {
  const theme = useTheme();
  const [selected, setSelected] = React.useState<T[]>([]);
  const hooks: any = [useSortBy, useRowSelect];
  const { t } = useTranslation();

  // need to unify this with the destructure from the props above
  const {
    checkable = false,
    flex = true,
    hideBorders = false,
    expandable = false,
    pagination = {
      enabled: false,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    manualSortBy = false,
    sortBy: initialSortBy = [],
  } = options;

  const [sortByValue, setSortByValue] = React.useState<SortBy[]>([]);

  if (pagination.enabled) {
    // The pagination hooks has to come before 'useRowSelect'
    hooks.splice(1, 0, usePagination);
  }

  if (expandable) {
    hooks.push(expansionHook);
  }

  if (checkable) {
    hooks.push(
      selectionHook({
        handleRowSelect,
        handleRowsSelect,
        checkIfCheckboxEnabled,
      })
    );
  }

  if (flex) {
    hooks.push(useFlexLayout);
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    // @ts-expect-error overrides outdated react table types
    page,
    prepareRow,
    // @ts-expect-error overrides outdated react table types
    state: { selectedRowIds, pageSize, sortBy },
    visibleColumns,
    // @ts-expect-error overrides outdated react table types
    setPageSize,
    // @ts-expect-error overrides outdated react table types
    setSortBy,
  } = useTable<T>(
    {
      data,
      columns,
      sortTypes: {
        alphanumeric: useCallback(alphanumeric, []),
      },
      initialState: {
        // @ts-expect-error overrides outdated react table types
        pageIndex: 0,
        pageSize: pagination.pageSize,
        sortBy: sortByValue,
      },
      manualSortBy,
    },
    ...hooks
  );

  // override expanded state when expanded ids are provided from outside
  if (expandedIds) {
    rows.forEach((row: any) => {
      row.isExpanded = expandedIds[row.original.id]; // eslint-disable-line no-param-reassign
    });
  }

  // override selected state when selected ids are provided from outside
  if (selectedIds) {
    rows.forEach((row: any) => {
      row.isSelected = selectedIds[row.original.id]; // eslint-disable-line no-param-reassign
    });
  }

  // override indeterminate state when indeterminate ids are provided from outside
  if (indeterminateIds) {
    rows.forEach((row: any) => {
      row.isIndeterminate = indeterminateIds[row.original.id]; // eslint-disable-line no-param-reassign
    });
  }

  const CustomTableHead = TableHead; // || from props
  const CustomTableRow = TableRow; // || from props

  // keep a nice track of the selected items so we can give them to the renderProps
  React.useEffect(() => {
    const values = Object.keys(selectedRowIds).map((key: any) => data[key]);
    if (selected.length !== 0 && values.length !== 0) {
      setSelected(values);
    }
  }, [selectedRowIds]);

  // Store new sort state
  React.useEffect(() => {
    if (!isEqual(sortBy, sortByValue)) {
      setSortByValue(sortBy);
      if (handleSort) {
        handleSort(sortBy);
      }
    }
  }, [sortBy]);

  // Set table sort by value if its controlled by external source
  React.useEffect(() => {
    if (manualSortBy && !isEqual(initialSortBy, sortByValue)) {
      setSortByValue(initialSortBy);
      setSortBy(initialSortBy);
    }
  }, [initialSortBy]);

  const { style, ...rest } = getTableProps();

  const parentStyles = {
    // backgroundColor: hideScrollbars ? '' : '',
    ...style,
  };

  const rowOptions = {
    selectedStyle: options?.rowOptions?.selectedStyle,
    hoveredStyle: options?.rowOptions?.hoveredStyle,
    freezeHoverComponentOnRow: options.freezeHoverComponentOnRow,
  };

  const showFooterForPaginationButton =
    pagination.enabled && rows.length > pagination.pageSize;

  const renderShowMore = React.useMemo(() => {
    if (showFooterForPaginationButton) {
      return (
        <Footer>
          {pageSize < rows.length ? (
            <LoadMoreButton
              onClick={() => setPageSize(pageSize + pagination.pageSize)}
            />
          ) : (
            <EndPaginationText level={2}>
              {t('Please, use filters to refine your search results')}
            </EndPaginationText>
          )}
        </Footer>
      );
    }

    return null;
  }, [pageSize, showFooterForPaginationButton]);

  const handleColumnHeadClick = (column: TS_FIX_ME) => {
    if (column.disableSorting) return;
    column?.toggleSortBy?.(!column.isSortedDesc);
  };

  const tableContent = (
    <>
      <TableWrap {...rest} style={parentStyles} data-testid={id}>
        <Thead>
          {headerGroups.map((headerGroup: HeaderGroup<T>) => (
            <TableRow
              {...headerGroup.getHeaderGroupProps()}
              hideBorders={hideBorders}
              key={`table-header-${id}-${headerGroup.id}`}
            >
              {headerGroup.headers.map((column: any) => {
                return (
                  <CustomTableHead
                    scrollTable={scrollTable}
                    theme={theme}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    onClick={() => handleColumnHeadClick(column)}
                    width={column.width}
                    key={`custom-table-header-${id}-${headerGroup.id}-${column.id}`}
                  >
                    <CellContent>
                      <MarginRightSmallContainer>
                        {column.render('Header')}
                      </MarginRightSmallContainer>
                      {!column.disableSorting && (
                        <TableColumnSortIcons column={column} />
                      )}
                    </CellContent>
                  </CustomTableHead>
                );
              })}
              {renderRowHoverComponent && <RowHoverHeader />}
            </TableRow>
          ))}
        </Thead>
        <tbody {...getTableBodyProps()}>
          {(pagination.enabled ? page : rows).map((row: TS_FIX_ME) => {
            prepareRow(row);
            const isExpanded = expandable
              ? expandedIds[get(row, 'original.id')]
              : get(row, 'isSelected');

            const expanded = renderRowSubComponent && isExpanded;
            return (
              <CustomRow<T>
                key={`table-${row.id || get(row, 'original.id')}`}
                row={row}
                visibleColumns={visibleColumns}
                TableRow={CustomTableRow}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                handleRowClick={handleRowClick}
                handleDoubleClick={handleDoubleClick}
                renderRowSubComponent={renderRowSubComponent}
                rowOptions={rowOptions}
                expanded={expanded}
                disabledRowClickCells={disabledRowClickCells}
                renderRowHoverComponent={renderRowHoverComponent}
              />
            );
          })}
        </tbody>
      </TableWrap>

      {renderShowMore}
    </>
  );

  return (
    <>
      {scrollTable ? (
        <Scrollbars showFooter={showFooterForPaginationButton}>
          {tableContent}
        </Scrollbars>
      ) : (
        tableContent
      )}
      {renderChildren &&
        renderChildren({
          selected: selectedIds
            ? data.filter((row: any) => selectedIds[row.id])
            : selected,
        })}
    </>
  );
};

export const Table = React.memo(TableInner) as typeof TableInner;
