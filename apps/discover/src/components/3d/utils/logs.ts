import {
  DepthMeasurementDataColumnInternal,
  DepthMeasurementWithData,
} from 'domain/wells/measurements/internal/types';

import reduce from 'lodash/reduce';

import { ILog, ILogRow, ILogRowColumn } from '@cognite/node-visualizer';
import { DepthMeasurementValueTypeEnum } from '@cognite/sdk-wells';

import { WellboreId } from 'modules/wellSearch/types';

export const mapLogsTo3D = (
  wellLogs: Record<string, DepthMeasurementWithData[]>
): Record<WellboreId, ILog[]> => {
  return reduce(
    wellLogs,
    (wellLogsTo3DMap, wellboreLogs, wellboreId) => ({
      ...wellLogsTo3DMap,
      [wellboreId]: wellboreLogs.map<ILog>(adaptDepthMeasurmentToILog),
    }),
    {}
  );
};

export const adaptDepthMeasurmentToILog = (
  depthMeasurement: DepthMeasurementWithData
): ILog => {
  const { wellboreAssetExternalId, wellboreMatchingId, source } =
    depthMeasurement;

  return {
    assetId: wellboreAssetExternalId as unknown as number,
    id: wellboreMatchingId as unknown as number,
    name: source.sourceName,
    state: 'LOADED',
    items: adaptDepthMeasurementDataToILogRows(depthMeasurement),
  };
};

export const adaptDepthMeasurementDataToILogRows = (
  depthMeasurementData: DepthMeasurementWithData
): ILogRow[] => {
  const { rows, columns, depthColumn } = depthMeasurementData;

  const depthColumnAsILogRowColumn: ILogRowColumn = {
    externalId: depthColumn.externalId,
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
  depthMeasurementDataColumn: DepthMeasurementDataColumnInternal
): ILogRowColumn => {
  const { externalId, valueType, name, measurementType } =
    depthMeasurementDataColumn;

  return {
    externalId,
    valueType,
    name: name || measurementType,
  };
};
