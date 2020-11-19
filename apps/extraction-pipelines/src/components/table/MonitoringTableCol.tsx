import React from 'react';
import { Cell } from 'react-table';
import { Icon } from '@cognite/cogs.js';
import StatusMarker from '../integrations/cols/StatusMarker';
import StatusFilterDropdown from './StatusFilterDropdown';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import { CellProps } from '../../model/Runs';

enum TableHeadings {
  SEEN = 'Seen',
  LAST_RUN = 'Last run',
  LAST_SEEN = 'Last seen',
}

export const getMonitoringTableCol = () => {
  return [
    {
      Header: TableHeadings.SEEN,
      accessor: 'timestamp',
      sortType: 'basic',
      Cell: (cell: Cell) => {
        return <TimeDisplay value={cell.value} relative withTooltip />;
      },
      disableFilters: true,
    },
    {
      Header: TableHeadings.LAST_RUN,
      accessor: 'status',
      Cell: (cell: Cell) => {
        return <StatusMarker status={cell.value} />;
      },
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'includes',
      disableFilters: false,
    },
    {
      Header: TableHeadings.LAST_SEEN,
      accessor: 'statusSeen',
      Cell: ({ row, cell }: CellProps) =>
        row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                paddingLeft: `${row.depth * 2}rem`,
              },
            })}
          >
            <StatusMarker status={cell.value} />
            {row.isExpanded ? <Icon type="Down" /> : <Icon type="Right" />}
          </span>
        ) : (
          <StatusMarker status={cell.value} />
        ),
      disableSortBy: true,
      Filter: StatusFilterDropdown,
      filter: 'includes',
      disableFilters: false,
    },
  ];
};
