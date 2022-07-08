import { toDistance } from 'utils/units/toDistance';

import { DepthMeasurementData } from '@cognite/sdk-wells';

import { DepthMeasurementDataInternal } from '../types';

import { normalizeDepthIndexColumn } from './normalizeDepthIndexColumn';

export const normalizeDepthMeasurementData = (
  rawDepthMeasurementData: DepthMeasurementData
): DepthMeasurementDataInternal => {
  const { depthColumn, depthUnit } = rawDepthMeasurementData;

  return {
    ...rawDepthMeasurementData,
    depthColumn: normalizeDepthIndexColumn(depthColumn),
    depthUnit: toDistance(depthUnit.unit),
  };
};
