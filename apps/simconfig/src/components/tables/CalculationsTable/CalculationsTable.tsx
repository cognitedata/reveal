import { Table } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';

import StatusCell from './StatusCell';

type ComponentProps = {
  data: FileInfoSerializable[];
};

export default function CalculationsTable({ data }: ComponentProps) {
  const cols = [
    {
      id: 'calculationType',
      Header: 'Calculation Type',
      accessor: (row: FileInfoSerializable) =>
        `${row.metadata?.calcName} - ${row.metadata?.calcType}`,
      width: 1000,
    },
    {
      id: 'latestRun',
      Header: 'Latest Run',
      accessor: (row: FileInfoSerializable) => `${row.externalId}`,
      width: 100,
      Cell: ({
        cell: {
          row: { original },
        },
      }: any) => <StatusCell data={original} />,
    },
  ];

  return <Table<FileInfoSerializable> dataSource={data} columns={cols} />;
}
