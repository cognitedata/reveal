import React from 'react';
import { Column } from 'react-table';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import { RunUI } from 'model/Runs';
import { TranslationKeys } from 'common';

export enum RunTableHeading {
  TIMESTAMP = 'Timestamp',
  MESSAGE = 'Message',
}

export const getRunLogTableCol = (
  _t: (key: TranslationKeys) => string
): Column<RunUI>[] => {
  return [
    {
      Header: _t('timestamp'),
      accessor: 'createdTime',
      sortType: 'basic',
      Cell: ({ row }) => {
        return <TimeDisplay value={row.original.createdTime} withTooltip />;
      },
      disableFilters: true,
    },
    {
      Header: _t('last-run-status'),
      accessor: 'status',
      Cell: ({ row }) => {
        return <StatusMarker status={row.original.status} />;
      },
      disableFilters: true,
    },
    {
      Header: _t('message'),
      accessor: 'message',
      Cell: ({ row }) => {
        return <p>{row.original.message}</p>;
      },
      disableFilters: true,
    },
  ];
};
