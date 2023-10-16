import React, { useMemo, useContext } from 'react';

import styled from 'styled-components';

import {
  getHighlightQuery,
  getTableColumns,
  Table,
  TableProps,
  TimeDisplay,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { Chart, ChartListContext } from '@cognite/charts-lib';
import { Body } from '@cognite/cogs.js';

import { DateRangeProps, useTranslation } from '@data-exploration-lib/core';

export interface ChartsTableProps
  extends Omit<TableProps<Chart>, 'columns'>,
    DateRangeProps {}

export const ChartsTable = ({ query, ...props }: ChartsTableProps) => {
  const { data, ...rest } = props;

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { PreviewPlotContainer } = useContext(ChartListContext);

  const columns = useMemo(() => {
    return [
      {
        ...tableColumns.name(getHighlightQuery(true, query)),
        enableHiding: false,
      },
      {
        id: 'chart-preview',
        header: 'Preview',
        size: 100,
        cell: ({ row }) => {
          return (
            <StyledPreviewPlot>
              <PreviewPlotContainer chart={row.original} />
            </StyledPreviewPlot>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        id: 'updatedAt',
        header: t('LAST_UPDATED', 'Last updated'),
        cell: ({ getValue, row }) => {
          console.log('CT, LU; row, getValue: ', row, getValue());
          return (
            <Body level={2}>
              <TimeDisplay
                value={getValue<number | Date>()}
                relative
                withTooltip
              />
            </Body>
          );
        },
      },
      {
        accessorKey: 'userInfo.displayName',
        id: 'displayName',
        header: t('OWNER', 'Owner'),
        cell: ({ getValue }) => <Body level={2}>{getValue<string>()}</Body>,
      },
    ] as ColumnDef<Chart>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return <Table<Chart> columns={columns} data={data || []} {...rest} />;
};

const StyledPreviewPlot = styled.div`
  width: 80px;
  height: 80px;
  border: 1px solid var(--cogs-greyscale-grey2);
`;
