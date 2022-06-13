import convert from 'convert-units';

import { DistanceUnit, DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

const UNIT_MAP: Record<UserPreferredUnit, DistanceUnitEnum> = {
  [UserPreferredUnit.FEET]: DistanceUnitEnum.Foot,
  [UserPreferredUnit.METER]: DistanceUnitEnum.Meter,
};

export const toDistanceUnit = (
  unit: UserPreferredUnit | DistanceUnitEnum | convert.Unit,
  factor?: number
): DistanceUnit => {
  let safeUnit: DistanceUnitEnum;

  if (unit in UNIT_MAP) {
    safeUnit = UNIT_MAP[unit as UserPreferredUnit];
  } else {
    safeUnit = unit as DistanceUnitEnum;
  }

  return {
    unit: safeUnit,
    factor,
  };
};
