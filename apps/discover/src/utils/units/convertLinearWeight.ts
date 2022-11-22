import convert, { Mass } from 'convert-units';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import {
  LinearWeight as LinearWeightSDK,
  WeightUnitEnum,
} from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { changeUnitTo } from './changeUnitTo';
import { LinearWeight } from './constants';

const WEIGHT_UNIT_MAP: Record<WeightUnitEnum, Mass> = {
  kilogram: 'kg',
  pound: 'lb',
};

const DISTANCE_WEIGHT_UNIT_MAP: Record<UserPreferredUnit, Mass> = {
  [UserPreferredUnit.FEET]: 'lb',
  [UserPreferredUnit.METER]: 'kg',
};

export const convertLinearWeight = (
  linearWeight: LinearWeightSDK,
  userPreferredUnit: UserPreferredUnit,
  toFixed = Fixed.TwoDecimals
): LinearWeight | undefined => {
  const {
    value,
    unit: { weightUnit, depthUnit },
  } = linearWeight;

  const fromWeightUnit = WEIGHT_UNIT_MAP[weightUnit];
  const toWeightUnit = DISTANCE_WEIGHT_UNIT_MAP[userPreferredUnit];

  try {
    const depthFactor = changeUnitTo(1, depthUnit, userPreferredUnit);

    if (!depthFactor) {
      return undefined;
    }

    const convertedValue =
      convert(value).from(fromWeightUnit).to(toWeightUnit) / depthFactor;

    return {
      value: toFixedNumberFromNumber(convertedValue, toFixed),
      unit: {
        weightUnit: toWeightUnit,
        depthUnit: userPreferredUnit,
      },
    };
  } catch {
    return undefined;
  }
};
