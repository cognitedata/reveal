import { Distance } from 'convert-units';
import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { DistanceUnitEnum } from '@cognite/sdk-wells';

import { changeUnitTo } from '.';
import { ConvertedDistance } from './constants';
import { getSafeUnit } from './getSafeUnit';

export type DistanceType = {
  value: number;
  unit: DistanceUnitEnum | Distance;
};

export const convertDistance = (
  distance: DistanceType,
  toUnit: Distance,
  toFixed = Fixed.ThreeDecimals
): ConvertedDistance => {
  const { value, unit: fromUnit } = distance;

  const convertedValue = changeUnitTo(value, fromUnit, toUnit);

  if (isUndefined(convertedValue)) {
    return {
      value: getFixedValueIfRequired(value, toFixed),
      unit: getSafeUnit(fromUnit) as Distance,
    };
  }

  return {
    value: getFixedValueIfRequired(convertedValue, toFixed),
    unit: toUnit,
  };
};

const getFixedValueIfRequired = (value: number, toFixed?: Fixed) => {
  if (toFixed) {
    return toFixedNumberFromNumber(value, toFixed);
  }
  return value;
};
