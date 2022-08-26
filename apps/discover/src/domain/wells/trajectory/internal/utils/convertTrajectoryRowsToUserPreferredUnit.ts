import { changeUnitTo } from 'utils/units';
import { toDistance } from 'utils/units/toDistance';

import {
  DistanceUnitEnum,
  TrajectoryDataRow,
} from '@cognite/sdk-wells/dist/src';

import { UserPreferredUnit } from 'constants/units';

type DepthUnitsType = {
  trueVerticalDepthUnit: DistanceUnitEnum;
  measuredDepthUnit: DistanceUnitEnum;
};

export const convertTrajectoryRowsToUserPreferredUnit = (
  rows: TrajectoryDataRow[],
  userPreferredUnit: UserPreferredUnit,
  { trueVerticalDepthUnit, measuredDepthUnit }: DepthUnitsType
) => {
  const tvdUnit = toDistance(trueVerticalDepthUnit);
  const mdUnit = toDistance(measuredDepthUnit);

  if (tvdUnit === userPreferredUnit && mdUnit === userPreferredUnit) {
    return rows;
  }

  return rows.map((row) => {
    const { trueVerticalDepth, measuredDepth } = row;
    return {
      ...row,
      trueVerticalDepth:
        changeUnitTo(trueVerticalDepth, tvdUnit, userPreferredUnit) || 0,
      measuredDepth:
        changeUnitTo(measuredDepth, mdUnit, userPreferredUnit) || 0,
    };
  });
};
