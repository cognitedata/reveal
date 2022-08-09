import React from 'react';
import { Column } from 'react-table';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import { RunUI } from 'model/Runs';
import { TableHeadings } from 'components/table/ExtpipeTableCol';

export enum RunTableHeading {
  TIMESTAMP = 'Timestamp',
  MESSAGE = 'Message',
}
export const getRunLogTableCol = (): Column<RunUI>[] => {
  return [
    {
      Header: RunTableHeading.TIMESTAMP,
      accessor: 'createdTime',
      sortType: 'basic',
      Cell: ({ row }) => {
        return <TimeDisplay value={row.original.createdTime} withTooltip />;
      },
      disableFilters: true,
    },
    {
      Header: TableHeadings.LAST_RUN_STATUS,
      accessor: 'status',
      Cell: ({ row }) => {
        return <StatusMarker status={row.original.status} />;
      },
      disableFilters: true,
    },
    {
      Header: RunTableHeading.MESSAGE,
      accessor: 'message',
      Cell: ({ row }) => {
        return <p>{row.original.message}</p>;
      },
      disableFilters: true,
    },
  ];
};
