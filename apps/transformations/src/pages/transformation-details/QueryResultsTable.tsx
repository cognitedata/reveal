import { useMemo } from 'react';
import BaseTable, { AutoResizer, ColumnShape } from 'react-base-table';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import EmptyState from '@transformations/components/empty-state';
import { Cell } from '@transformations/containers/raw-preview-content/raw-table/Cell';
import { ExpandedCellModal } from '@transformations/containers/raw-preview-content/raw-table/ExpandedCellModal';
import { QueryPreviewSuccess, Warning } from '@transformations/hooks';
import { Schema } from '@transformations/types';
import {
  reactBaseTableDataGetter,
  TABLE_ROW_HEIGHT,
} from '@transformations/utils';

import { Body, Colors, Flex, Tooltip } from '@cognite/cogs.js';

const getQueryResultsTableCellStyle = (name = '', warnings?: Warning[]) => {
  const warning = warnings?.find((w) => w.column === name);
  if (warning) {
    switch (warning.type) {
      case 'column-missing': {
        return {
          backgroundColor: Colors['surface--status-critical--muted--default'],
        };
      }
      case 'incorrect-type': {
        return {
          backgroundColor: Colors['surface--status-warning--muted--default'],
        };
      }
      case 'unknown-column': {
        return {
          backgroundColor:
            Colors['surface--status-undefined--muted--default--alt'],
        };
      }
      default: {
        return undefined;
      }
    }
  }
};

type QueryResultsTableProps = {
  data: QueryPreviewSuccess;
  warnings?: Warning[];
};

const QueryResultsTableHeader = ({
  column,
  type,
  warnings,
}: {
  column: ColumnShape;
  type: Schema['type'];
  warnings: Warning[];
}): JSX.Element => {
  const cellStyles = getQueryResultsTableCellStyle(column.dataKey, warnings);
  const sparkColumnType = typeof type === 'string' ? type : type.type;

  return (
    <StyledTableCellContainer style={{ ...cellStyles }}>
      <Tooltip content={column.title}>
        <Flex gap={8} justifyContent="space-between">
          <StyledTableCell strong>{column.title}</StyledTableCell>
          <StyledTableCellInfo>
            {sparkColumnType.toLowerCase()}
          </StyledTableCellInfo>
        </Flex>
      </Tooltip>
    </StyledTableCellContainer>
  );
};

const QueryResultsTableContent = ({
  cellData,
  column,
  columnIndex,
  rowIndex,
  warnings,
}: {
  cellData: any;
  column: ColumnShape;
  columnIndex: number;
  rowIndex: number;
  warnings: Warning[];
}): JSX.Element => {
  const cellStyles = getQueryResultsTableCellStyle(column.dataKey, warnings);
  return (
    <Cell
      cellData={cellData}
      columnIndex={columnIndex}
      rowIndex={rowIndex}
      style={{ ...cellStyles }}
    />
  );
};

const QueryResultsTable = ({
  data,
  warnings,
}: QueryResultsTableProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: queryPreview } = data ?? {};

  const columns: ColumnShape<Record<string, any>>[] = useMemo(
    () =>
      warnings
        ? [
            {
              key: 'index',
              dataKey: 'index',
              width: 56,
              minWidth: 56,
              flexShrink: 0,
              frozen: 'left',
              cellRenderer: (props: any) => (
                <QueryResultsTableContent {...props} />
              ),
            },
            ...(warnings
              ?.filter((w) => w.type === 'column-missing')
              .map(({ column, sqlType }) => ({
                key: column,
                dataKey: column,
                title: column,
                width: 200,
                minWidth: 150,
                flexGrow: 1,
                flexShrink: 0,
                resizable: true,
                headerRenderer: (props: any) => (
                  <QueryResultsTableHeader
                    {...props}
                    type={sqlType}
                    warnings={warnings}
                  />
                ),
                cellRenderer: (props: any) => (
                  <QueryResultsTableContent {...props} warnings={warnings} />
                ),
                dataGetter: reactBaseTableDataGetter,
              })) ?? []),
            ...(queryPreview?.schema?.items.map((item) => ({
              key: item.name,
              dataKey: item.name,
              title: item.name,
              width: 200,
              minWidth: 150,
              flexGrow: 1,
              flexShrink: 0,
              resizable: true,
              headerRenderer: (props: any) => (
                <QueryResultsTableHeader
                  {...props}
                  type={item.type}
                  warnings={warnings}
                />
              ),
              cellRenderer: (props: any) => (
                <QueryResultsTableContent {...props} warnings={warnings} />
              ),
              dataGetter: reactBaseTableDataGetter,
            })) ?? []),
          ]
        : [],
    [queryPreview, warnings]
  );

  const rows: any[] = useMemo(() => {
    return (
      queryPreview?.results.items.map((item, i) => ({
        ...item,
        index: i + 1,
      })) ?? []
    );
  }, [queryPreview]);

  if (rows.length === 0) {
    return (
      <EmptyState
        description={t('query-returned-no-results-description')}
        title={t('query-returned-no-results')}
      />
    );
  }

  return (
    <StyledQueryResultsTableContainer>
      <StyledBaseTableWrapper>
        <AutoResizer>
          {({ width, height }) => (
            <StyledBaseTable
              rowKey="key"
              width={width}
              height={height}
              rowHeight={TABLE_ROW_HEIGHT}
              headerHeight={TABLE_ROW_HEIGHT}
              columns={columns}
              data={rows}
            />
          )}
        </AutoResizer>
      </StyledBaseTableWrapper>
      <ExpandedCellModal />
    </StyledQueryResultsTableContainer>
  );
};

const StyledQueryResultsTableContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 90px;
`;

const StyledBaseTableWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translate(0);
  border-right: 1px solid ${Colors['decorative--grayscale--300']};
  border-left: 1px solid ${Colors['decorative--grayscale--300']};
`;

const TABLE_PREFIX = 'BaseTable';
// @ts-ignore
const StyledBaseTable = styled(BaseTable)`
  .${TABLE_PREFIX} {
    &__table {
      box-shadow: none;
      box-sizing: border-box;
    }
    &__table-main {
      outline: none;
    }
    &__header-row {
      height: 32px;
      box-shadow: none;
    }
    &__header-cell {
      padding: 0;
      border-top: 1px solid ${Colors['decorative--grayscale--300']};
      background-color: ${Colors['decorative--grayscale--100']};
      &:hover {
        background-color: ${Colors['decorative--grayscale--200']};
      }
      &:last-child {
        padding-right: 0;
      }
    }
    &__row-cell {
      flex-wrap: wrap;
      overflow: visible !important;
      padding: 0;
      &:last-child {
        padding-right: 0;
      }
    }
    &__header-cell,
    &__row-cell {
      border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
      border-right: 1px solid ${Colors['decorative--grayscale--300']};
    }
    &__header-cell:first-child,
    &__row-cell:first-child {
      padding: 0;
      background-color: ${Colors['decorative--grayscale--100']};
    }
    &__header-row,
    &__row {
      border-bottom: none;
    }
    &__row:hover {
      .${TABLE_PREFIX}__row-cell {
        background-color: ${Colors['decorative--grayscale--200']};
      }
    }
  }
`;

const StyledTableCellContainer = styled.div`
  padding: 4px 12px;
  height: 100%;
  width: 100%;
`;

const StyledTableCell = styled(Body).attrs({
  level: 3,
})`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTableCellInfo = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted']};
  font-weight: normal;
`;

export default QueryResultsTable;
