import {
  DataTransfersTableData,
  DataTransfersTableKeys,
} from 'pages/DataTransfers/types';

export function getColumnNames(
  dataTransferObjects: DataTransfersTableData[]
): DataTransfersTableKeys[] {
  if (dataTransferObjects.length > 0) {
    return Object.keys(dataTransferObjects[0]) as DataTransfersTableKeys[];
  }
  return [];
}
