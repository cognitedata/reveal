import isObject from 'lodash/isObject';
import {
  DataTransfersTableData,
  MappedColumnNames,
} from 'pages/DataTransfers/types';

export function getColumnNames(
  dataTransferObjects: DataTransfersTableData[]
): MappedColumnNames[] {
  if (dataTransferObjects.length > 0) {
    return Object.entries(dataTransferObjects[0]).map(([key, value]) => {
      if (isObject(value)) {
        return { parent: key, name: Object.keys(value) };
      }

      return { parent: undefined, name: key };
    }) as MappedColumnNames[];
  }
  return [];
}
