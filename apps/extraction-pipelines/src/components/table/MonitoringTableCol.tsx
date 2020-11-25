import React from 'react';
import { Cell } from 'react-table';
import { Icon } from '@cognite/cogs.js';
import StatusMarker from '../integrations/cols/StatusMarker';
import StatusFilterDropdown from './StatusFilterDropdown';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import { Run } from '../../model/Runs';

enum TableHeadings {
  TIMESTAMP = 'Timestamp',
  STATUS_RUN = 'Status run',
  STATUS_SEEN = 'Status seen',
}

export const getMonitoringTableCol = () => {
  return [
    {
      Header: TableHeadings.TIMESTAMP,
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
      Header: TableHeadings.STATUS_RUN,
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
      Header: TableHeadings.STATUS_SEEN,
      accessor: 'statusSeen',
      Cell: ({ row }: Cell<Run>) =>
        row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                paddingLeft: `${row.depth * 2}rem`,
              },
            })}
          >
            <StatusMarker status={row.values.statusSeen} />
            {row.isExpanded ? <Icon type="Down" /> : <Icon type="Right" />}
          </span>
        ) : (
          <StatusMarker status={row.values.statusSeen} />
        ),
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'includes',
      disableFilters: false,
    },
  ];
};
