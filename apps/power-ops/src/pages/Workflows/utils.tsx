import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { Detail } from '@cognite/cogs.js';
import { ViewMoreButton } from 'components/ViewMoreButton/ViewMoreButton';
import { OpenInFusion } from 'components/OpenInFusion/OpenInFusion';
import { StatusLabel } from 'components/StatusLabel/StatusLabel';
import { calculateDuration } from 'utils/utils';

import { CellWrapper } from './elements';

export const handleCopyButtonClick = async (text: string | undefined) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

const reusableColumns: Column[] = [
  {
    accessor: 'eventType',
    Header: 'Workflow Type / External ID',
    disableSortBy: true,
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
    accessor: (values: any) => {
      if (values?.eventCreationTime && values?.eventEndTime) {
        return calculateDuration(
          values?.eventCreationTime,
          values?.eventEndTime
        );
      }
      return '';
    },
  },
];

export const processColumns: Column[] = [
  ...reusableColumns,
  {
    accessor: 'actions',
    disableSortBy: true,
    Cell: ({ row }: CellProps<any>) => (
      <CellWrapper>
        <OpenInFusion eventExternalId={row.original.eventExternalId} />
      </CellWrapper>
    ),
  },
];

export const workflowsColumns: Column[] = [
  ...reusableColumns,
  {
    accessor: 'actions',
    disableSortBy: true,
    Cell: ({ row }: CellProps<any>) => (
      <CellWrapper>
        <ViewMoreButton eventExternalId={row.original.eventExternalId} />
        <OpenInFusion eventExternalId={row.original.eventExternalId} />
      </CellWrapper>
    ),
  },
];
