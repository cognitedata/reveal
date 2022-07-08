import { toAngel } from 'utils/units/toAngel';
import { toDistance } from 'utils/units/toDistance';

import { TrajectoryData } from '@cognite/sdk-wells';

import { TrajectoryDataInternal } from '../types';
import { toDoglegSeverityUnitInternal } from '../utils/toDoglegSeverityUnitInternal';

export const normalizeTrajectoryData = (
  rawTrajectoryData: TrajectoryData
): TrajectoryDataInternal => {
  const {
    measuredDepthUnit,
    inclinationUnit,
    azimuthUnit,
    trueVerticalDepthUnit,
    equivalentDepartureUnit,
    offsetUnit,
    doglegSeverityUnit,
  } = rawTrajectoryData;

  return {
    ...rawTrajectoryData,
    measuredDepthUnit: toDistance(measuredDepthUnit),
    inclinationUnit: toAngel(inclinationUnit),
    azimuthUnit: toAngel(azimuthUnit),
    trueVerticalDepthUnit: toDistance(trueVerticalDepthUnit),
    equivalentDepartureUnit: toDistance(equivalentDepartureUnit),
    offsetUnit: toDistance(offsetUnit),
    doglegSeverityUnit: toDoglegSeverityUnitInternal(doglegSeverityUnit),
  };
};
