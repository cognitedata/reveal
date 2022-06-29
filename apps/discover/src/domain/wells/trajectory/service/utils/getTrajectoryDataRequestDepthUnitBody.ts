import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { TrajectoryDataRequest } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export const getTrajectoryDataRequestDepthUnitBody = (
  unit?: UserPreferredUnit
): Pick<TrajectoryDataRequest, 'measuredDepth' | 'trueVerticalDepth'> => {
  if (!unit) {
    return {};
  }

  const distanceUnit = toDistanceUnitEnum(unit);

  return {
    measuredDepth: { unit: distanceUnit },
    trueVerticalDepth: { unit: distanceUnit },
  };
};
