import { Table, Button } from '@cognite/cogs.js';
import moment from 'moment';
import { EventSerializable } from 'store/event/types';
import { STATUS_TYPE } from 'components/tables/CalculationsTable/constants';
import { CapitalizedLabel } from 'pages/elements';
import { setSelectedEvent } from 'store/event';
import { useAppDispatch } from 'store/hooks';

type ComponentProps = {
  data: EventSerializable[];
};

export default function RunHistoryTable({ data }: ComponentProps) {
  const dispatch = useAppDispatch();

  const onEventSelection = (event: EventSerializable) =>
    dispatch(setSelectedEvent(event));

  const cols = [
    {
      id: 'runType',
      Header: 'Run Type',
      accessor: (row: EventSerializable) => {
        return `${row.metadata?.runType || 'N/A'}`.toLocaleUpperCase();
      },
      width: 1000,
    },
    {
      id: 'runTime',
      Header: 'Run Time',
      accessor: (row: EventSerializable) => row.lastRunTime,
      Cell: ({ cell: { value } }: any) => (
        <>{moment(value).format('YYYY-MM-DD HH:mm')}</>
      ),
      width: 1000,
    },
    {
      id: 'status',
      Header: 'Status',
      accessor: (row: EventSerializable) => `${row.metadata?.status}`,
      Cell: ({ cell: { value } }: any) => (
        <CapitalizedLabel size="medium" variant={STATUS_TYPE[value]}>
          {value}
        </CapitalizedLabel>
      ),
    },
    {
      id: 'message',
      Header: 'Message',
      accessor: (row: EventSerializable) =>
        `${row.metadata?.statusMessage || ''}`,
      width: 1000,
    },
    {
      id: 'Model Version',
      Header: 'Model Version',
      accessor: (row: EventSerializable) =>
        `${row.metadata?.modelVersion || 'N/A'}`,
      width: 1000,
    },
    {
      id: 'details',
      Header: 'Details',
      accessor: (row: EventSerializable) => (
        <Button
          icon="Info"
          onClick={() => onEventSelection(row)}
          aria-label="show-run-details"
        />
      ),
    },
  ];

  return (
    <Table<EventSerializable>
      pagination
      filterable
      dataSource={data}
      columns={cols}
    />
  );
}
