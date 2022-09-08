import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { Detail } from '@cognite/cogs.js';
import { WorkflowActions } from 'components/WorkflowActions/WorkflowActions';
import { StatusLabel } from 'components/StatusLabel/StatusLabel';
import { calculateDuration } from 'utils/utils';

export const handleCopyButtonClick = async (text: string | undefined) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

export const processColumns: Column[] = [
  {
    accessor: 'eventType',
    Header: 'Workflow Type / External ID',
    Cell: ({ row }: CellProps<any>) => (
      <>
        <div className="cogs-body-2 strong">{row.values.eventType}</div>
        <Detail
          style={{
            overflowWrap: 'anywhere',
            color: 'var(--cogs-text-icon--medium)',
          }}
        >
          {row.original.eventExternalId}
        </Detail>
      </>
    ),
  },
  {
    accessor: 'status',
    Header: 'Status',
    Cell: ({ value }) => useMemo(() => <StatusLabel status={value} />, [value]),
  },
  {
    accessor: 'eventCreationTime',
    Header: 'Triggered',
    Cell: ({ value }) =>
      Date.parse(value) ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value,
  },
  {
    accessor: 'eventStartTime',
    Header: 'Started',
    Cell: ({ value }) =>
      Date.parse(value) ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value,
  },
  {
    accessor: 'eventEndTime',
    Header: 'Finished/Failed',
    Cell: ({ value }) =>
      Date.parse(value) ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value,
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
];

export const workflowsColumns: Column[] = [
  ...processColumns,
  {
    accessor: 'actions',
    Cell: ({ row }: CellProps<any>) => (
      <WorkflowActions eventExternalId={row.original.eventExternalId} />
    ),
  },
];
