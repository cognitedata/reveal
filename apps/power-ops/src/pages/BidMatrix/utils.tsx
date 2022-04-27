import { CogniteClient, SequenceItem } from '@cognite/sdk';
import { Column } from 'react-table';
import { SequenceRow, TableData, TableRow, Cols } from 'types';

interface BidMatrixResponse {
  columns: Column<TableData>[];
  data: TableData[];
}

export const getBidMatrixData = async (
  client: CogniteClient | undefined,
  matrixExternalId: string | undefined
): Promise<SequenceRow[] | undefined> => {
  const sequenceRows = await client?.sequences
    .retrieveRows({
      externalId: matrixExternalId || '',
    })
    .autoPagingToArray({ limit: 100 });

  return sequenceRows;
};

export const formatBidMatrixData = async (
  sequenceRows: SequenceRow[]
): Promise<BidMatrixResponse> => {
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
        id: `${index + 1}`,
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

export const copyMatrixToClipboard = async (
  sequenceCols: Column<TableData>[],
  sequenceData: TableData[]
): Promise<boolean> => {
  // Put sequenceData in proper order
  const copyData = sequenceData?.map((row) => {
    // Remove id
    const newrow: TableRow = { ...row };
    delete newrow.id;

    const orderedRow: TableRow = {};
    sequenceCols?.forEach((col) => {
      const comp = col.accessor?.toString();
      if (comp && col.id && comp in newrow) {
        orderedRow[col.id] = newrow[comp];
      }
    });

    // Insert hour at start of row
    orderedRow[0] = newrow.hour;

    // Return row in copiable format
    return Object.values(orderedRow).join('\t');
  });

  // Create header row in copiable format
  const cols = sequenceCols
    ?.map((column) => {
      return column.Header;
    })
    .join('\t');

  if (!copyData || !cols) {
    return false;
  }
  // Add header row
  copyData.unshift(cols);

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(copyData.join('\n')).catch((error) => {
      throw new Error(error);
    });

    return true;
  } catch (error) {
    return false;
  }
};
