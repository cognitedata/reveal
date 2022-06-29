import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

const DISTANCE_UNIT_MAP: Record<UserPreferredUnit, DistanceUnitEnum> = {
  [UserPreferredUnit.FEET]: DistanceUnitEnum.Foot,
  [UserPreferredUnit.METER]: DistanceUnitEnum.Meter,
};

export const toDistanceUnitEnum = (unit: UserPreferredUnit) => {
  return DISTANCE_UNIT_MAP[unit];
};
