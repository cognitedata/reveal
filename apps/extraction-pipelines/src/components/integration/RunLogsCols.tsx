import React from 'react';
import { Cell, Column } from 'react-table';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import { RunUI } from 'model/Runs';
import { TableHeadings } from 'components/table/IntegrationTableCol';

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
      Cell: ({ row }: Cell<RunUI>) => {
        return <TimeDisplay value={row.original.createdTime} withTooltip />;
      },
      disableFilters: true,
    },
    {
      Header: TableHeadings.LAST_RUN_STATUS,
      accessor: 'status',
      Cell: ({ row }: Cell<RunUI>) => {
        return <StatusMarker status={row.original.status} />;
      },
      disableFilters: true,
    },
    {
      Header: RunTableHeading.MESSAGE,
      accessor: 'message',
      Cell: ({ row }: Cell<RunUI>) => {
        return <p>{row.original.message}</p>;
      },
      disableFilters: true,
    },
  ];
};
