import { useMemo } from 'react';
import { calculateDuration } from 'utils/utils';
import StatusLabel from 'components/StatusLabel/StatusLabel';
import { Column } from 'react-table';

import SubProcessStatuses from './SubProcessStatuses';

export const processListColumns: Column[] = [
  {
    accessor: 'eventType',
    Header: 'Process Type',
  },
  {
    accessor: 'eventExternalId',
    Header: 'External ID',
    Cell: ({ value }) =>
      useMemo(
        () => <small style={{ overflowWrap: 'anywhere' }}>{value}</small>,
        [value]
      ),
  },
  {
    accessor: 'eventCreationTime',
    Header: 'Triggered',
    Cell: ({ value }) =>
      Date.parse(value) ? new Date(value).toLocaleString() : value,
  },
  {
    accessor: 'eventStartTime',
    Header: 'Started',
    Cell: ({ value }) =>
      Date.parse(value) ? new Date(value).toLocaleString() : value,
  },
  {
    accessor: 'eventEndTime',
    Header: 'Finished/Failed',
    Cell: ({ value }) =>
      Date.parse(value) ? new Date(value).toLocaleString() : value,
  },
  {
    Header: 'Duration',
    accessor: 'duration',
    Cell: ({ row }) => {
      if (row.values.eventStartTime && row.values.eventEndTime) {
        return calculateDuration(
          row.values.eventStartTime,
          row.values.eventEndTime
        );
      }
      return '';
    },
  },
  {
    accessor: 'subProcessStatuses',
    Header: 'Subprocess Statuses',
    Cell: ({ row }) =>
      useMemo(
        () => (
          <SubProcessStatuses
            processEventExternalId={row.values.eventExternalId}
          />
        ),
        [row.values.eventExternalId]
      ),
  },
  {
    accessor: 'status',
    Header: 'Status',
    Cell: ({ value }) => useMemo(() => <StatusLabel status={value} />, [value]),
  },
];
