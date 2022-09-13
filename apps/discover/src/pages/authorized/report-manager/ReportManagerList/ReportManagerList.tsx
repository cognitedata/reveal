// this is recommended on the react-table site
// not sure if we should look into optimising this or if it's fine as it is
// let's leave it like this and test performance
/* eslint-disable react/no-unstable-nested-components */

import { Report } from 'domain/reportManager/internal/types';

import * as React from 'react';

/*
 * Filters are off for now
 * https://github.com/TanStack/table/issues/4190
 * fixed via potentially: https://github.com/TanStack/table/pull/4376
 */

import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  // Column,
  useReactTable,
  ExpandedState,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  FilterFn,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

import { ColumnFilter } from './ColumnFilter';
import {
  HeaderPadded,
  ExpandableRow,
  StyledIcon,
  PaddedRow,
  TableContainer,
  HeadContainer,
  HeaderContainer,
  CellText,
  CellIcon,
  SubRowContainer,
  MainRowContainer,
  HoverContentWrapper,
} from './elements';
import { StatusSelector } from './StatusSelector';
import { TableColumnSortIcons } from './TableColumnSortIcons';
import { TableReport, UpdateReport } from './types';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const transformReportForDisplay = (report: Report) => {
  return {
    ...report,
    externalId: report.reportType,
  };
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export interface Props {
  data: TableReport[];
  isAdmin?: boolean;
  onReportUpdate: UpdateReport;
}
export const ReportManagerList: React.FC<Props> = ({
  data,
  isAdmin,
  onReportUpdate,
}) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const columns = React.useMemo<ColumnDef<TableReport>[]>(
    () => [
      {
        header: () => <HeaderPadded>Wellbore / Data sets</HeaderPadded>,
        accessorKey: 'externalId',
        filterFn: 'fuzzy',
        enableColumnFilter: false,
        cell: ({ row, getValue }) => {
          if (row.getCanExpand()) {
            return (
              <ExpandableRow
                depth={row.depth}
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getIsExpanded() ? (
                  <StyledIcon type="ChevronDown" />
                ) : (
                  <StyledIcon type="ChevronUp" />
                )}
                {` ${getValue()}`}
              </ExpandableRow>
            );
          }

          return <PaddedRow depth={row.depth}>{getValue()}</PaddedRow>;
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => 'Status',
        accessorKey: 'status',
        filterFn: 'fuzzy',
        enableColumnFilter: false,
        footer: (props) => props.column.id,
        cell: ({ getValue, row }) => {
          const value = getValue() as Report['status'];

          if (!value) {
            return '';
          }

          return (
            <StatusSelector
              value={value}
              onReportUpdate={onReportUpdate}
              isAdmin={isAdmin}
              id={row.original.id}
            />
          );
        },
      },
      {
        header: () => 'Reported issues',
        accessorKey: 'reason',
        filterFn: 'fuzzy',
        enableColumnFilter: false,
        footer: (props) => props.column.id,
      },
      {
        id: 'Last updated',
        header: () => 'Last updated',
        accessorKey: 'lastUpdatedTime',
        footer: (props) => props.column.id,
        enableColumnFilter: false,
      },
      {
        header: () => 'Description',
        accessorKey: 'description',
        filterFn: 'fuzzy',
        enableColumnFilter: false,
        footer: (props) => props.column.id,
      },
      {
        header: () => 'Reported by',
        accessorKey: 'ownerUserId',
        filterFn: 'fuzzy',
        enableColumnFilter: false,
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      expanded,
      columnFilters,
    },
    filterFromLeafRows: true,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });

  // expand all by default:
  const expandAll = table.getToggleAllRowsExpandedHandler();
  React.useEffect(() => {
    expandAll(false);
  }, []);

  const renderRowHoverComponent = React.useCallback(
    ({ _row }: any) => <div>test</div>,
    []
  );

  return (
    <TableContainer>
      <table>
        <HeadContainer>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <HeaderContainer
                        {...{
                          'aria-label': 'sortable',
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                        }}
                        role="button"
                        tabIndex={index}
                      >
                        <CellText>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </CellText>
                        <CellIcon>
                          <TableColumnSortIcons
                            state={
                              (header.column.getIsSorted() as string) ?? null
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          />
                          {header.column.getCanFilter() ? (
                            <ColumnFilter column={header.column} />
                          ) : null}
                        </CellIcon>
                      </HeaderContainer>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </HeadContainer>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const RowContainer =
              row.depth > 0 ? SubRowContainer : MainRowContainer;
            return (
              <RowContainer key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
                <td>
                  {renderRowHoverComponent && (
                    <HoverContentWrapper>
                      {renderRowHoverComponent({ row })}
                    </HoverContentWrapper>
                  )}
                </td>
              </RowContainer>
            );
          })}
        </tbody>
      </table>
    </TableContainer>
  );
};
