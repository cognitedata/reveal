import { DEFAULT_CONFIG, WORKFLOW_TYPES } from '@cognite/power-ops-api-types';
import { CogniteEvent, DoubleDatapoint } from '@cognite/sdk';
import { Column } from 'react-table';
import { TableData, TableRow, BidMatrixData } from 'types';
import { calculateScenarioProduction } from 'utils/utils';

export interface BidMatrixTableData {
  columns: Column<TableData>[];
  data: TableData[];
}

const numberOfDecimals = (tickSize: string = DEFAULT_CONFIG.DECIMAL_POINTS) =>
  Number.isInteger(Number(tickSize)) ? 0 : tickSize?.split('.')[1].length;

export const formatBidMatrixData = (
  matrixData: BidMatrixData,
  tickSize: string = DEFAULT_CONFIG.DECIMAL_POINTS
): BidMatrixTableData => {
  // Get desired number of decimal places from market configuration tick_size
  const decimals = numberOfDecimals(tickSize);

  // Create array of table columns
  const formattedHeaders = matrixData.headerRow.map((header, index) => ({
    Header:
      typeof header === 'number' ? String(header.toFixed(decimals)) : header,
    accessor: String(header).replace('.', ','),
    disableSortBy: true,
    id: String(index),
  }));

  // Create array of table data
  const tableData = matrixData.dataRows.map((row, rowIndex) =>
    row.reduce(
      (prev, curr, columnIndex) => ({
        ...prev,
        [formattedHeaders[columnIndex].accessor]: curr,
      }),
      { id: rowIndex } as { id: number } & Record<string, string | number>
    )
  );

  tableData.forEach(({ Hour }, index) => {
    tableData[index].Hour = Number(Hour) + 1;
  });

  // Make bidmatrix table the same height as price scenario table
  tableData.push({ id: NaN });

  return {
    columns: formattedHeaders,
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
    if (
      sequenceCols[0]?.accessor &&
      typeof sequenceCols[0]?.accessor === 'string'
    ) {
      orderedRow[0] = newrow[sequenceCols[0].accessor];
    }

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

export const formatScenarioData = (
  scenarioPricePerHour: DoubleDatapoint[],
  matrixData: BidMatrixData
): { id: number; base: string; production: string }[] => {
  const dataArray: { id: number; base: string; production: string }[] = [];
  const production = calculateScenarioProduction(
    scenarioPricePerHour,
    matrixData
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
          base: scenarioPricePerHour[index].value.toFixed(2),
          production: production[index].value.toFixed(1),
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
    base: averageBasePrice.toFixed(2),
    production: totalProduction.toFixed(2),
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
    parentProcessEventExternalId.includes(
      WORKFLOW_TYPES.DAY_AHEAD_BID_MATRIX_CALCULATION
    )
  );
};
