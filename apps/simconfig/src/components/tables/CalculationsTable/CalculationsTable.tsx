import { useContext } from 'react';
import { Table, TableRow } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch } from 'store/hooks';
import { setSelectedCalculation } from 'store/file';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { fetchCalculationFile } from 'store/file/thunks';
import { CdfClientContext } from 'providers/CdfClientProvider';

import StatusCell from './StatusCell';

type ComponentProps = {
  data: FileInfoSerializable[];
};

export default function CalculationsTable({ data }: ComponentProps) {
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const { url } = useRouteMatch();
  const history = useHistory();
  const onRowClick = async (row: TableRow<FileInfoSerializable>) => {
    const { original } = row;
    if (!original.externalId) {
      throw new Error('No external Id');
    }
    await dispatch(setSelectedCalculation(original));
    await dispatch(
      fetchCalculationFile({
        client: cdfClient,
        externalId: { externalId: original.externalId },
      })
    );
    history.push(`${url}/configuration`);
  };

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

  return (
    <Table<FileInfoSerializable>
      dataSource={data}
      columns={cols}
      onRowClick={onRowClick}
    />
  );
}
