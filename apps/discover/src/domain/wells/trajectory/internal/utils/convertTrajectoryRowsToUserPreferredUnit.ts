import { changeUnitTo } from 'utils/units';
import { toDistance } from 'utils/units/toDistance';

import { DistanceUnitEnum, TrajectoryDataRow } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

export type DepthUnitsType = {
  trueVerticalDepthUnit: DistanceUnitEnum;
  measuredDepthUnit: DistanceUnitEnum;
  equivalentDepartureUnit: DistanceUnitEnum;
  offsetUnit: DistanceUnitEnum;
};

export const convertTrajectoryRowsToUserPreferredUnit = (
  rows: TrajectoryDataRow[],
  userPreferredUnit: UserPreferredUnit,
  {
    trueVerticalDepthUnit,
    measuredDepthUnit,
    equivalentDepartureUnit,
    offsetUnit,
  }: DepthUnitsType
): TrajectoryDataRow[] => {
  const tvdUnit = toDistance(trueVerticalDepthUnit);
  const mdUnit = toDistance(measuredDepthUnit);
  const edUnit = toDistance(equivalentDepartureUnit);
  const offSet = toDistance(offsetUnit);

  if (
    tvdUnit === userPreferredUnit &&
    mdUnit === userPreferredUnit &&
    edUnit === userPreferredUnit &&
    offSet === userPreferredUnit
  ) {
    return rows;
  }

  return rows.map((row) => {
    const {
      trueVerticalDepth,
      measuredDepth,
      equivalentDeparture,
      eastOffset,
      northOffset,
    } = row;

    return {
      ...row,
      trueVerticalDepth:
        changeUnitTo(trueVerticalDepth, tvdUnit, userPreferredUnit) || 0,
      measuredDepth:
        changeUnitTo(measuredDepth, mdUnit, userPreferredUnit) || 0,
      equivalentDeparture:
        changeUnitTo(equivalentDeparture, edUnit, userPreferredUnit) || 0,
      eastOffset: changeUnitTo(eastOffset, offSet, userPreferredUnit) || 0,
      northOffset: changeUnitTo(northOffset, offSet, userPreferredUnit) || 0,
    };
  });
};
