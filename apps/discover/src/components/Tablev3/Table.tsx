/* eslint-disable no-param-reassign */
import React, { useCallback, useMemo } from 'react';
import {
  useTable,
  useSortBy,
  useRowSelect,
  useFlexLayout,
  usePagination,
  HeaderGroup,
} from 'react-table';

import { TS_FIX_ME } from 'core';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { sortByAlphanumeric } from 'utils/sort';

import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';
import { SortBy } from 'pages/types';
import { MarginRightSmallContainer } from 'styles/layout';

import { TableWrap, TableRow, TableHead, CellContent, Thead } from './elements';
import { selectionHook, expansionHook, indentationHook } from './hooks';
import { TableResults } from './resultTypes';
import { ShowMore } from './ShowMore';
import { getStickyColumnHeadersStyles } from './stickyColumnHandler';
import { TableColumnSortIcons } from './TableColumnSortIcons';
import { CustomRow } from './TableRow';
import { TableProps } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
const TableInner = <T extends Object>({
  id,
  data,
  indent,
  columns: columnsOriginal,
  handleRowClick,
  handleMouseEnter,
  handleMouseLeave,
  handleDoubleClick,
  handleRowSelect,
  handleRowsSelect,
  renderChildren,
  Footer,
  renderRowSubComponent,
  renderRowOverlayComponent,
  renderRowHoverComponent,
  checkIfCheckboxEnabled,
  handleSort,
  options = {},
  selectedIds,
  expandedIds = EMPTY_OBJECT as TableResults,
  highlightedIds = EMPTY_OBJECT as TableResults,
  indeterminateIds = EMPTY_OBJECT as TableResults,
  disabledRowClickCells = EMPTY_ARRAY,
  hideHeaders,
}: React.PropsWithChildren<TableProps<T>>) => {
  const [selected, setSelected] = React.useState<T[]>([]);
  const [tableWidth, setTableWidth] = React.useState<number>(1000);
  const hooks: any = [useSortBy, useRowSelect];
  const TableWrapperRef = React.useRef<HTMLElement>(null);

  // NOTE: This is not working correctly. Will fix later. This should run every
  //       time the table gets resized. Currently it just runs on init.
  React.useEffect(() => {
    if (TableWrapperRef.current) {
      setTableWidth(TableWrapperRef.current.getBoundingClientRect().width);
    }
  });

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
      selectionHook<T>({
        handleRowSelect,
        handleRowsSelect,
        checkIfCheckboxEnabled,
      })
    );
  }

  if (indent) {
    hooks.push(indentationHook<T>(indent));
  }

  if (flex) {
    hooks.push(useFlexLayout);
  }

  /**
   * When the `accessor` is missing in the column, the sorting doesn't work.
   * To enable sorting, react-table needs the `accessor` to be defined.
   * Hence, this validates the columns.
   */
  const columns = React.useMemo(
    () =>
      columnsOriginal.map((column) => {
        if (column.accessor) {
          return column;
        }
        return {
          ...column,
          accessor: '',
        };
      }),
    [columnsOriginal]
  );

  const {
    getTableProps,
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
        alphanumeric: useCallback(sortByAlphanumeric, []),
      },
      initialState: {
        // @ts-expect-error overrides outdated react table types
        pageIndex: 0,
        pageSize: pagination.pageSize,
        sortBy: initialSortBy,
      },
      manualSortBy,
    },
    ...hooks
  );

  // Expand, Highlight or Select rows, or show indeterminate checkboxes when needed
  if (expandedIds || highlightedIds || selectedIds || indeterminateIds) {
    rows.forEach((row: any) => {
      row.isExpanded = expandedIds[row.original.id];
      row.isHighlighted = highlightedIds[row.original.id];
      row.isSelected = selectedIds && selectedIds[row.original.id];
      row.isIndeterminate = indeterminateIds[row.original.id];
    });
  }

  const CustomTableHead = TableHead;
  const CustomTableRow = TableRow;

  // keep a nice track of the selected items so we can give them to the renderProps
  React.useEffect(() => {
    const values = Object.keys(selectedRowIds).map((key: any) => data[key]);
    if (!isEmpty(selected) && !isEmpty(values)) {
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

  const rowOptions = useMemo(() => {
    return {
      selectedStyle: options?.rowOptions?.selectedStyle,
      hoveredStyle: options?.rowOptions?.hoveredStyle,
    };
  }, [options?.rowOptions?.selectedStyle, options?.rowOptions?.hoveredStyle]);

  const handleColumnHeadClick = (column: TS_FIX_ME) => {
    if (column.disableSorting) {
      return;
    }
    column?.toggleSortBy?.(!column.isSortedDesc);
  };

  /**
   * Generates a css grid-template-columns string based on the given column
   * sizes, and adds minmax where necessary.
   */
  const getGridColumns = React.useMemo(() => {
    const cssColumns: string = headerGroups
      .flatMap((headerGroup: HeaderGroup<T>) =>
        headerGroup.headers.map((column: any) => {
          const { width } = column;
          const matchOnlyNumbers = /^[0-9]*$/;

          // When the maxWidth is not provided, it will be Number.MAX_SAFE_INTEGER by default (🤯 )
          // However, we want these columns to have a fixed width. So we use the regular width as
          // the max-width so that it doesn't stretch.
          const maxWidth =
            column.maxWidth === Number.MAX_SAFE_INTEGER
              ? column.width
              : column.maxWidth;

          // If the width or MaxWidth just contains numbers, Throw an error message
          if (matchOnlyNumbers.test(width) || matchOnlyNumbers.test(maxWidth)) {
            // eslint-disable-next-line
            console.error(
              'Column width or maxWidth should include a unit like "px" or "em"'
            );
          }

          return width === maxWidth ? width : `minmax(${width},${maxWidth})`;
        })
      )
      .join(' ');

    let gridColumns = cssColumns;

    // Add an extra cell if there is an OverlayComponent
    if (renderRowOverlayComponent) {
      gridColumns = `${gridColumns} 20px`;
    }

    // Add an extra cell if there is a HoverComponent
    if (renderRowHoverComponent) {
      gridColumns = `${gridColumns} 0`;
    }

    return gridColumns;
  }, [headerGroups]);

  const tableContent = (
    <TableWrap
      {...rest}
      style={style}
      data-testid={id}
      gridColumns={getGridColumns}
      ref={TableWrapperRef}
      tableWidth={tableWidth}
    >
      {!hideHeaders && (
        <Thead>
          {headerGroups.map((headerGroup: HeaderGroup<T>) => {
            const stickyColumnStyles = getStickyColumnHeadersStyles(
              headerGroup.headers,
              columns
            );

            return (
              <TableRow
                {...headerGroup.getHeaderGroupProps()}
                hideBorders={hideBorders}
                data-testid="table-header-row"
                key={`table-header-${id}-${headerGroup.id}`}
              >
                {headerGroup.headers.map((column: any, index) => (
                  <CustomTableHead
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={stickyColumnStyles[index]}
                    onClick={() => handleColumnHeadClick(column)}
                    data-testid="table-header-cell"
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
                ))}

                {/* To keep the amount of cells correct, we need to render something
                where the overlay cells would be in the header
              */}
                {renderRowOverlayComponent && <TableHead />}
                {renderRowHoverComponent && <div />}
              </TableRow>
            );
          })}
        </Thead>
      )}

      {(pagination.enabled ? page : rows).map((row: TS_FIX_ME) => {
        prepareRow(row);
        const isExpanded = expandable
          ? expandedIds[get(row, 'original.id')]
          : get(row, 'isSelected');

        const isHighlighted = get(row, 'isHighlighted');
        const expanded = renderRowSubComponent && isExpanded;

        return (
          <CustomRow<T>
            key={`table-${get(row, 'original.id') || row.id}`}
            columns={columns}
            row={row}
            visibleColumns={visibleColumns}
            TableRow={CustomTableRow}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            handleRowClick={handleRowClick}
            handleDoubleClick={handleDoubleClick}
            highlighted={isHighlighted}
            renderRowSubComponent={(props) =>
              renderRowSubComponent?.({ ...props, sortBy })
            }
            rowOptions={rowOptions}
            expanded={expanded}
            selected={row.isSelected}
            disabledRowClickCells={disabledRowClickCells}
            renderRowOverlayComponent={renderRowOverlayComponent}
            renderRowHoverComponent={renderRowHoverComponent}
          />
        );
      })}

      {Footer && <Footer />}

      {/* this is the client side pagination */}
      {/* potentially in the future we can move this into the above optional Footer^ */}
      <ShowMore
        showingSize={pageSize}
        enabled={pagination.enabled}
        pageSizeLimit={pagination.pageSize}
        totalClientData={rows.length}
        setPageSize={setPageSize}
      />
    </TableWrap>
  );

  return (
    <>
      {tableContent}
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
