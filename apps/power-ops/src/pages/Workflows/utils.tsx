import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Column } from 'react-table';
import { Detail } from '@cognite/cogs.js';
import { StatusLabel } from 'components/StatusLabel/StatusLabel';
import { ViewMoreButton } from 'components/ViewMoreButton/ViewMoreButton';
import { OpenInFusion } from 'components/OpenInFusion/OpenInFusion';
import { calculateDuration } from 'utils/utils';
import { Process, ProcessStatus, Workflow } from '@cognite/power-ops-api-types';

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

export const processColumns: Column<Process>[] = [
  {
    accessor: 'eventType',
    Header: 'Workflow Type / External ID',
    disableSortBy: true,
    Cell: ({ row }) => (
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
    Cell: ({ value }: { value: ProcessStatus }) =>
      useMemo(() => <StatusLabel status={value} />, [value]),
  },
  {
    accessor: 'eventCreationTime',
    Header: 'Triggered',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    accessor: 'eventStartTime',
    Header: 'Started',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    accessor: 'eventEndTime',
    Header: 'Finished/Failed',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    Header: 'Duration',
    accessor: (values) => {
      if (values.eventCreationTime && values.eventEndTime) {
        return calculateDuration(values.eventCreationTime, values.eventEndTime);
      }
      return '';
    },
  },
  {
    accessor: 'eventExternalId',
    disableSortBy: true,
    Cell: ({ value }) =>
      useMemo(
        () => (
          <CellWrapper>
            <OpenInFusion type="event" endPoint="events" externalId={value} />
          </CellWrapper>
        ),
        [value]
      ),
  },
];

export const workflowsColumns: Column<Workflow>[] = [
  {
    accessor: 'eventType',
    Header: 'Workflow Type / External ID',
    disableSortBy: true,
    Cell: ({ row, value }) => (
      <>
        <div className="cogs-body-2 strong">{value}</div>
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
    Cell: ({ value }: { value: ProcessStatus }) =>
      useMemo(() => <StatusLabel status={value} />, [value]),
  },
  {
    accessor: 'eventCreationTime',
    Header: 'Triggered',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    accessor: 'eventStartTime',
    Header: 'Started',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    accessor: 'eventEndTime',
    Header: 'Finished/Failed',
    Cell: ({ value }) => (
      <>{value ? dayjs(value).format('DD MMM, YYYY HH:mm:ss') : value}</>
    ),
  },
  {
    Header: 'Duration',
    accessor: (values) => {
      if (values.eventCreationTime && values.eventEndTime) {
        return calculateDuration(values.eventCreationTime, values.eventEndTime);
      }
      return '';
    },
  },
  {
    accessor: 'eventExternalId',
    disableSortBy: true,
    Cell: ({ value }) =>
      useMemo(
        () => (
          <CellWrapper>
            <ViewMoreButton eventExternalId={value} />
            <OpenInFusion type="event" endPoint="events" externalId={value} />
          </CellWrapper>
        ),
        [value]
      ),
  },
];
