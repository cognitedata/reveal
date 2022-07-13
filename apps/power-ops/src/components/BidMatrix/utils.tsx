import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import { CogniteEvent, DoubleDatapoint } from '@cognite/sdk';
import { Column } from 'react-table';
import { TableData, TableRow, TableColumn, MatrixWithData } from 'types';
import { calculateScenarioProduction, roundWithDec } from 'utils/utils';

interface BidMatrixResponse {
  columns: Column<TableData>[];
  data: TableData[];
}

export const formatBidMatrixData = async (
  matrix: MatrixWithData
): Promise<BidMatrixResponse> => {
  // Create array of table columns
  const formattedColumnHeaders: TableColumn[] = matrix.columnHeaders.map(
    (columnHeader, index) => {
      const formattedValue =
        typeof columnHeader === 'number'
          ? `${roundWithDec(columnHeader, 1)}`
          : columnHeader;
      const accessor = columnHeader?.toString().replace('.', '');
      return {
        Header: `${formattedValue}`,
        accessor,
        disableSortBy: true,
        id: `${index}`,
      } as TableColumn;
    }
  );

  // Create array of table data
  const tableData: TableData[] = [];
  matrix.dataRows?.forEach((row, rowIndex) => {
    row.forEach((value: number | string, index) => {
      if (!tableData[rowIndex]) {
        tableData[rowIndex] = {
          id: index,
        };
      }
      const { accessor } = formattedColumnHeaders[index];
      if (accessor) {
        // first value in each row should be the 1-based hour of the day (1-24)
        tableData[rowIndex][accessor] = index === 0 ? rowIndex + 1 : value;
      }
    });
  });

  // Make bidmatrix table the same height as price scenario table
  tableData.push({ id: undefined });

  return {
    columns: formattedColumnHeaders as Column<TableData>[],
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
  matrix: MatrixWithData
): Promise<{ id: number; base: string; production: string }[]> => {
  const dataArray: { id: number; base: string; production: string }[] = [];
  const production = calculateScenarioProduction(scenarioPricePerHour, matrix);

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
          base: roundWithDec(scenarioPricePerHour[index].value as number, 2),
          production: roundWithDec(production[index].value as number, 1),
        });
    }
  }

  // Add total production and average base price
  const averageBasePrice =
    dataArray.reduce((total, next) => total + parseFloat(next.base), 0) /
    dataArray.length;
  const totalProduction = dataArray.reduce(
    (total, next) => total + parseFloat(next.production),
    0
  );
  dataArray.push({
    id: 24,
    base: roundWithDec(averageBasePrice, 2),
    production: roundWithDec(totalProduction, 2),
  });

  return dataArray;
};

export const isNewBidMatrixAvailable = (
  processFinishEvent: CogniteEvent,
  currentBidProcessExternalId: string
): boolean => {
  const parentProcessEventExternalId =
    processFinishEvent.metadata?.event_external_id;

  return !!(
    parentProcessEventExternalId &&
    parentProcessEventExternalId !== currentBidProcessExternalId &&
    parentProcessEventExternalId.includes(EVENT_TYPES.BID_PROCESS)
  );
};
