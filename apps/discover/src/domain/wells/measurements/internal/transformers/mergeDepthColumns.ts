import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import {
  DepthMeasurementColumn,
  DepthMeasurementDataColumn,
} from '@cognite/sdk-wells';

import { WdlMeasurementType } from '../../service/types';
import { DepthMeasurementDataColumnInternal } from '../types';
import { getMeasurementTypeMap } from '../utils/getMeasurementTypeMap';

const ANGLE_CURVES_UNIT = 'deg';

export const mergeDepthColumns = (
  depthMeasurementColumns: DepthMeasurementColumn[],
  depthMeasurementDataColumns: DepthMeasurementDataColumn[]
): DepthMeasurementDataColumnInternal[] => {
  if (isEmpty(depthMeasurementDataColumns)) {
    return [];
  }

  const keyedDepthMeasurementColumns = keyBy(
    depthMeasurementColumns,
    'columnExternalId'
  );

  const measurementTypeMap = getMeasurementTypeMap();

  return depthMeasurementDataColumns.map((depthMeasurementDataColumn) => {
    const { externalId, measurementType, unit } = depthMeasurementDataColumn;
    const depthMeasurementColumn = keyedDepthMeasurementColumns[externalId];
    const measurementTypeParent =
      measurementTypeMap[measurementType as WdlMeasurementType];

    return {
      ...depthMeasurementDataColumn,
      description: depthMeasurementColumn?.description,
      measurementTypeParent,
      isAngle: unit === ANGLE_CURVES_UNIT,
    };
  });
};
