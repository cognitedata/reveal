import { MouseEvent } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Button, Table } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch } from 'store/hooks';
import { setSelectedCalculation } from 'store/file';

import StatusCell from './StatusCell';
import ViewHistoryCell from './ViewHistoryCell';
import RunCalculationCell from './RunCalculationCell';

type ComponentProps = {
  data: FileInfoSerializable[];
};

export default function CalculationsTable({ data }: ComponentProps) {
  const dispatch = useAppDispatch();

  const { url } = useRouteMatch();

  const history = useHistory();

  const onDetailsClicked = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const extId = e.currentTarget.getAttribute('data-external-id') || '';
    if (!extId) {
      throw new Error('No external Id');
    }
    const row = data.find((row) => row.externalId === extId);
    if (!row) {
      throw new Error('No row found');
    }

    dispatch(setSelectedCalculation(row));

    history.push(`${url}/configuration/${extId}`);
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
    {
      id: 'runCalc',
      Header: 'Run Calculation',
      accessor: (row: FileInfoSerializable) => `${row.externalId}`,
      width: 20,
      maxWidth: 20,
      Cell: ({
        cell: {
          row: { original },
        },
      }: any) => <RunCalculationCell data={original} />,
    },
    {
      id: 'viewRunHistory',
      Header: 'Run History',
      accessor: (row: FileInfoSerializable) => `${row.externalId}`,
      width: 20,
      maxWidth: 50,
      Cell: ({
        cell: {
          row: { original },
        },
      }: any) => <ViewHistoryCell data={original} />,
    },
    {
      id: 'details',
      Header: 'Details',
      accessor: (row: FileInfoSerializable) => `${row.externalId}`,
      width: 100,
      Cell: ({
        cell: {
          row: { original },
        },
      }: any) => (
        <Button
          icon="Info"
          aria-label="details"
          type="ghost"
          data-external-id={original.externalId}
          onClick={onDetailsClicked}
        />
      ),
    },
  ];

  return <Table<FileInfoSerializable> dataSource={data} columns={cols} />;
}
