import React from 'react';
import { Cell, Column, HeaderProps } from 'react-table';
import { Icon } from '@cognite/cogs.js';
import StatusMarker from '../integrations/cols/StatusMarker';
import StatusFilterDropdown from './StatusFilterDropdown';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import { Run } from '../../model/Runs';
import SorterIndicator from './SorterIndicator';

export enum MonitoringTableHeadings {
  TIMESTAMP = 'Timestamp',
  STATUS_RUN = 'Status run',
  STATUS_SEEN = 'Status seen',
}

export const getMonitoringTableCol = (): Column<Run>[] => {
  return [
    {
      Header: ({ column }: HeaderProps<Run>) => {
        return (
          <SorterIndicator
            name={MonitoringTableHeadings.TIMESTAMP}
            column={column}
          />
        );
      },
      accessor: 'timestamp',
      sortType: 'basic',
      Cell: ({ row }: Cell<Run>) => {
        return (
          <TimeDisplay value={row.values.timestamp} relative withTooltip />
        );
      },
      disableFilters: true,
    },
    {
      Header: MonitoringTableHeadings.STATUS_RUN,
      accessor: 'status',
      Cell: ({ row }: Cell<Run>) => {
        return <StatusMarker status={row.values.status} />;
      },
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'exactText',
      disableFilters: false,
    },
    {
      Header: MonitoringTableHeadings.STATUS_SEEN,
      accessor: 'statusSeen',
      Cell: ({ row }: Cell<Run>) => {
        let expandIcon = <></>;
        if (row.canExpand) {
          expandIcon = row.isExpanded ? (
            <Icon type="Down" />
          ) : (
            <Icon type="Right" />
          );
        }
        return (
          <>
            <StatusMarker status={row.values.statusSeen} />
            {expandIcon}
          </>
        );
      },
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'includes',
      disableFilters: false,
    },
  ];
};
