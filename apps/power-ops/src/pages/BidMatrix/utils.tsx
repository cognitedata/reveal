import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import {
  CogniteClient,
  CogniteEvent,
  DoubleDatapoint,
  SequenceItem,
} from '@cognite/sdk';
import { Column } from 'react-table';
import { SequenceRow, TableData, TableRow, Cols } from 'types';
import { calculateScenarioProduction, roundWithDec } from 'utils/utils';

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
    .autoPagingToArray({ limit: Infinity });

  return sequenceRows;
};

export const getFormattedBidMatrixData = async (
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
        typeof row[0] === 'number' ? `${roundWithDec(row[0])}` : row[0];
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
        typeof value === 'number' ? `${roundWithDec(value)}` : value;
      tableData[index][accessor] = formattedValue || 0;
    });
  });
  // Make bidmatrix table the same height as price scenario table
  tableData.push({ id: undefined });

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

export const formatScenarioData = async (
  scenarioPricePerHour: DoubleDatapoint[],
  sequenceRows: SequenceRow[]
): Promise<{ id: number; base: number; production: number }[]> => {
  const dataArray: { id: number; base: number; production: number }[] = [];
  const production = calculateScenarioProduction(
    scenarioPricePerHour,
    sequenceRows
  );

  if (scenarioPricePerHour.length && production?.length) {
    for (
      let index = 0;
      index < Math.min(scenarioPricePerHour.length, production.length);
      index++
    ) {
      if (
        Number.isFinite(scenarioPricePerHour[index]?.value) &&
        Number.isFinite(production?.[index]?.value)
      )
        dataArray.push({
          id: index,
          base: roundWithDec(scenarioPricePerHour[index].value as number),
          production: roundWithDec(production[index].value as number),
        });
    }
  }

  // Add total production and average base price
  const averageBasePrice =
    dataArray.reduce((total, next) => total + next.base, 0) / dataArray.length;
  const totalProduction = dataArray.reduce(
    (total, next) => total + next.production,
    0
  );
  dataArray.push({
    id: 24,
    base: Math.round(averageBasePrice * 100) / 100,
    production: Math.round(totalProduction * 100) / 100,
  });

  return dataArray;
};

export const isNewBidMatrixAvailable = async (
  processFinishEvent: CogniteEvent,
  client: CogniteClient,
  currentBidProcessExternalId: string
): Promise<boolean> => {
  const parentProcessEventExternalId =
    processFinishEvent.metadata?.event_external_id;

  if (!parentProcessEventExternalId || !client) {
    return false;
  }

  const [parentProcessEvent] = await client.events.retrieve([
    { externalId: parentProcessEventExternalId },
  ]);
  return (
    (parentProcessEvent.type === EVENT_TYPES.BID_PROCESS &&
      parentProcessEvent.externalId !== currentBidProcessExternalId) ||
    false
  );
};
