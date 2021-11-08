import { Table } from '@cognite/cogs.js';
import moment from 'moment';
import { EventSerializable } from 'store/event/types';
import { STATUS_TYPE } from 'components/tables/CalculationsTable/constants';
import { CapitalizedLabel } from 'pages/elements';

type ComponentProps = {
  data: EventSerializable[];
};

export default function RunHistoryTable({ data }: ComponentProps) {
  const cols = [
    {
      id: 'runType',
      Header: 'Run Type',
      accessor: (row: EventSerializable) => {
        return `${row.metadata?.runType}`.toLocaleUpperCase();
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
      Filter: Table.CheckboxColumnFilter(),
      filter: 'arrayContains',
      disableSortBy: true,
    },
    {
      id: 'message',
      Header: 'Message',
      accessor: (row: EventSerializable) => `${row.metadata?.statusMessage}`,
      width: 1000,
    },
    {
      id: 'Model Version',
      Header: 'Model Version',
      accessor: (row: EventSerializable) => `${row.metadata?.modelVersion}`,
      width: 1000,
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
