import { Table } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';

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
  ];

  return <Table<FileInfoSerializable> dataSource={data} columns={cols} />;
}
