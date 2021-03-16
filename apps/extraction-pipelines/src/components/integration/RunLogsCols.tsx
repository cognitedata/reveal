import React from 'react';
import { Cell, Column } from 'react-table';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import StatusFilterDropdown from 'components/table/StatusFilterDropdown';
import { StatusRun } from 'model/Runs';
import { TableHeadings } from 'components/table/IntegrationTableCol';

export enum RunTableHeading {
  TIMESTAMP = 'Timestamp',
  MESSAGE = 'Message',
}
export const getRunLogTableCol = (): Column<StatusRun>[] => {
  return [
    {
      Header: RunTableHeading.TIMESTAMP,
      accessor: 'createdTime',
      sortType: 'basic',
      Cell: ({ row }: Cell<StatusRun>) => {
        return <TimeDisplay value={row.original.createdTime} withTooltip />;
      },
      disableFilters: true,
    },
    {
      Header: TableHeadings.STATUS,
      accessor: 'status',
      Cell: ({ row }: Cell<StatusRun>) => {
        return <StatusMarker status={row.original.status} />;
      },
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'exactText',
      disableFilters: false,
    },
    {
      Header: RunTableHeading.MESSAGE,
      accessor: 'message',
      Cell: ({ row }: Cell<StatusRun>) => {
        return <p>{row.original.message}</p>;
      },
      disableFilters: true,
    },
  ];
};
