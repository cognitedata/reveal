import { CogniteClient, SequenceItem } from '@cognite/sdk';
import { Column } from 'react-table';

import { SequenceRow, TableData, Cols } from '../../models/sequences';

export const GetBidMatrixData = async (
  client: CogniteClient | undefined,
  matrixExternalId: string | undefined
) => {
  // Get bid matrix
  const sequenceRows = await client?.sequences
    .retrieveRows({
      externalId: matrixExternalId || '',
    })
    .autoPagingToArray({ limit: 100 });

  if (!sequenceRows?.length) {
    return {
      columns: [],
      data: [],
    };
  }

  // Create array of table columns
  let columnHeaders: Cols[] = sequenceRows.map(
    (row: SequenceRow, index: number) => {
      const formattedValue =
        typeof row[0] === 'number' ? `${Math.round(row[0] * 10) / 10}` : row[0];
      const accessor = row[0]?.toString().replace('.', '');
      return {
        Header: `${formattedValue}`,
        accessor,
        disableSortBy: true,
        id: index + 1,
      } as Cols;
    }
  );
  columnHeaders = [
    {
      Header: sequenceRows[0]?.columns[0]?.name?.replace('Price', 'Hour'),
      accessor: sequenceRows[0]?.columns[0]?.externalId?.replace(
        'price',
        'hour'
      ),
      disableSortBy: true,
      sticky: 'left',
      id: 0,
    },
    ...columnHeaders,
  ];

  // CDF Sequences have a particular format that needs to be transposed and massaged
  let transposedColumns = sequenceRows.map(
    (row: SequenceRow, index: number) => {
      const accessor = row[0]?.toString().replace('.', '');
      return { accessor, id: index + 1, values: row.slice(1) };
    }
  );
  transposedColumns = [
    {
      accessor: 'hour',
      id: 0,
      values: sequenceRows[0]?.columns
        .slice(1)
        .map((col) => col.name?.replace('1h.', '') as SequenceItem),
    },
    ...transposedColumns,
  ];

  // Create array of table data
  const tableData: TableData[] = [];
  transposedColumns?.forEach((col) => {
    col?.values.forEach((value, index) => {
      if (!tableData[index]) {
        tableData[index] = {
          id: index,
        };
      }
      const accessor = `${col?.accessor || 0}`;
      const formattedValue =
        typeof value === 'number' ? `${Math.round(value * 10) / 10}` : value;
      tableData[index][accessor] = formattedValue || 0;
    });
  });

  return {
    columns: columnHeaders as Column<TableData>[],
    data: tableData,
  };
};

export default GetBidMatrixData;
