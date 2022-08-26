import { toAngel } from 'utils/units/toAngel';
import { toDistance } from 'utils/units/toDistance';

import { TrajectoryData } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { TrajectoryDataInternal } from '../types';
import { convertTrajectoryRowsToUserPreferredUnit } from '../utils/convertTrajectoryRowsToUserPreferredUnit';
import { toDoglegSeverityUnitInternal } from '../utils/toDoglegSeverityUnitInternal';

export const normalizeTrajectoryData = (
  rawTrajectoryData: TrajectoryData,
  userPreferredUnit: UserPreferredUnit
): TrajectoryDataInternal => {
  const {
    measuredDepthUnit,
    inclinationUnit,
    azimuthUnit,
    trueVerticalDepthUnit,
    equivalentDepartureUnit,
    offsetUnit,
    doglegSeverityUnit,
    rows,
  } = rawTrajectoryData;

  return {
    ...rawTrajectoryData,
    measuredDepthUnit: userPreferredUnit,
    inclinationUnit: toAngel(inclinationUnit),
    azimuthUnit: toAngel(azimuthUnit),
    trueVerticalDepthUnit: userPreferredUnit,
    equivalentDepartureUnit: toDistance(equivalentDepartureUnit),
    offsetUnit: toDistance(offsetUnit),
    doglegSeverityUnit: toDoglegSeverityUnitInternal(doglegSeverityUnit),
    rows: convertTrajectoryRowsToUserPreferredUnit(rows, userPreferredUnit, {
      trueVerticalDepthUnit,
      measuredDepthUnit,
    }),
  };
};
