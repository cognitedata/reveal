import get from 'lodash/get';
import reduce from 'lodash/reduce';

import { ILog, ILogRow, ILogRowColumn } from '@cognite/node-visualizer';
import {
  DepthMeasurement,
  DepthMeasurementData,
  DepthMeasurementDataColumn,
  DepthMeasurementValueTypeEnum,
} from '@cognite/sdk-wells-v3';

import { WellboreId } from 'modules/wellSearch/types';

export const mapLogsTo3D = (
  wellLogs: Record<string, DepthMeasurement[]>,
  wellLogsRowData: Record<string, DepthMeasurementData>
): Record<WellboreId, ILog[]> => {
  return reduce(
    wellLogs,
    (wellLogsTo3DMap, wellboreLogs, wellboreId) => ({
      ...wellLogsTo3DMap,
      [wellboreId]: wellboreLogs.map<ILog>((depthMeasurement) => {
        const depthMeasurementData = get(
          wellLogsRowData,
          depthMeasurement.source.sequenceExternalId
        );

        return adaptDepthMeasurmentToILog(
          depthMeasurement,
          depthMeasurementData
        );
      }),
    }),
    {}
  );
};

export const adaptDepthMeasurmentToILog = (
  depthMeasurement: DepthMeasurement,
  depthMeasurementData?: DepthMeasurementData
): ILog => {
  const { wellboreAssetExternalId, wellboreMatchingId, source } =
    depthMeasurement;

  const items = depthMeasurementData
    ? adaptDepthMeasurementDataToILogRows(depthMeasurementData)
    : [];

  return {
    assetId: wellboreAssetExternalId as unknown as number,
    id: wellboreMatchingId as unknown as number,
    name: source.sourceName,
    state: 'LOADED',
    items,
  };
};

export const adaptDepthMeasurementDataToILogRows = (
  depthMeasurementData: DepthMeasurementData
): ILogRow[] => {
  const { rows, columns, depthColumn } = depthMeasurementData;

  const depthColumnAsILogRowColumn: ILogRowColumn = {
    externalId: depthColumn.columnExternalId,
    valueType: DepthMeasurementValueTypeEnum.Double,
    name: depthColumn.type,
  };

  return rows.map((row) => {
    const { rowNumber, depth, values } = row;

    const valuesMap = values.reduce<Record<number, number | null>>(
      (indexedRowValues, value, index) => ({
        ...indexedRowValues,
        // Since the depth value is indeed at `0`, we need to start indexing the rest from `1`.
        [index + 1]: value,
      }),
      {
        // Making the depth value as the first indexed value.
        0: depth,
      }
    );

    return {
      ...valuesMap,
      rowNumber,
      columns: [
        depthColumnAsILogRowColumn,
        ...columns.map(mapDepthMeasurementDataColumnToILogRowColumn),
      ],
    };
  });
};

export const mapDepthMeasurementDataColumnToILogRowColumn = (
  depthMeasurementDataColumn: DepthMeasurementDataColumn
): ILogRowColumn => {
  const { externalId, valueType, name, measurementType } =
    depthMeasurementDataColumn;

  return {
    externalId,
    valueType,
    name: name || measurementType,
  };
};
