import { normalizeDatum } from 'domain/wells/wellbore/internal/transformers/normalizeDatum';

import { DepthMeasurement } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { DepthMeasurementInternal } from '../types';

import { normalizeDepthIndexColumn } from './normalizeDepthIndexColumn';
import { normalizeDistanceRange } from './normalizeDistanceRange';

export const normalizeDepthMeasurement = (
  rawDepthMeasurement: DepthMeasurement,
  unit: UserPreferredUnit
): DepthMeasurementInternal => {
  const { depthColumn, datum, depthRange } = rawDepthMeasurement;

  return {
    ...rawDepthMeasurement,
    depthColumn: normalizeDepthIndexColumn(depthColumn),
    datum: datum && normalizeDatum(datum, unit),
    depthRange: depthRange && normalizeDistanceRange(depthRange, unit),
  };
};
