import React from 'react';
import { Cell, Column } from 'react-table';
import StatusMarker from '../integrations/cols/StatusMarker';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import StatusFilterDropdown from '../table/StatusFilterDropdown';
import { StatusRun } from '../../model/Runs';
import { MonitoringTableHeadings } from '../table/MonitoringTableCol';
import { TableHeadings } from '../table/IntegrationTableCol';

export enum RunTableHeading {
  MESSAGE = 'Message',
}
export const getRunLogTableCol = (): Column<StatusRun>[] => {
  return [
    {
      Header: MonitoringTableHeadings.TIMESTAMP,
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
