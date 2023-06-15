import React, { useMemo } from 'react';
import { Column, HeaderProps } from 'react-table';

import { useTranslation } from '@extraction-pipelines/common';
import StatusMarker from '@extraction-pipelines/components/extpipes/cols/StatusMarker';
import SorterIndicator from '@extraction-pipelines/components/table/SorterIndicator';
import { TimeDisplay } from '@extraction-pipelines/components/TimeDisplay/TimeDisplay';
import { RunApi } from '@extraction-pipelines/model/Runs';

import { ConfigurationLink } from './ConfigurationLink';

export enum RunTableHeading {
  TIMESTAMP = 'Timestamp',
  MESSAGE = 'Message',
}

export const useRunLogTableCol = (): Column<RunApi>[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        Header: ({ column }: HeaderProps<RunApi>) => {
          return <SorterIndicator name={t('timestamp')} column={column} />;
        },
        accessor: 'createdTime',
        sortType: 'basic',
        Cell: ({ row }) => {
          return <TimeDisplay value={row.original.createdTime} withTooltip />;
        },
        disableFilters: true,
      },
      {
        Header: ({ column }: HeaderProps<RunApi>) => {
          return (
            <SorterIndicator name={t('last-run-status')} column={column} />
          );
        },
        accessor: 'status',
        Cell: ({ row }) => {
          return <StatusMarker status={row.original.status} />;
        },
        disableFilters: true,
      },
      {
        Header: ({ column }: HeaderProps<RunApi>) => {
          return <SorterIndicator name={t('message')} column={column} />;
        },
        accessor: 'message',
        Cell: ({ row }) => {
          return <p>{row.original.message}</p>;
        },
        disableFilters: true,
      },
      {
        Header: t('column-header-config'),
        accessor: 'externalId',
        Cell: ({ row }) => {
          return <ConfigurationLink createdTime={row.values.createdTime} />;
        },
        disableFilters: true,
        disableSortBy: true,
      },
    ],
    [t]
  );
};
