import keyBy from 'lodash/keyBy';

import {
  DepthMeasurementColumn,
  DepthMeasurementDataColumn,
} from '@cognite/sdk-wells-v3';

import { DepthMeasurementDataColumnInternal } from '../types';

export const mergeDepthColumns = (
  depthMeasurementColumns: DepthMeasurementColumn[],
  depthMeasurementDataColumns: DepthMeasurementDataColumn[]
): DepthMeasurementDataColumnInternal[] => {
  const keyedDepthMeasurementColumns = keyBy(
    depthMeasurementColumns,
    'columnExternalId'
  );

  return depthMeasurementDataColumns.map((depthMeasurementDataColumn) => {
    const { externalId } = depthMeasurementDataColumn;
    const depthMeasurementColumn = keyedDepthMeasurementColumns[externalId];

    return {
      ...depthMeasurementDataColumn,
      description: depthMeasurementColumn?.description,
    };
  });
};
