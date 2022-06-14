import { Distance } from 'convert-units';
import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { Distance as DistanceWellsSDK } from '@cognite/sdk-wells-v3';

import { changeUnitTo } from '.';
import { ConvertedDistance } from './constants';
import { getSafeUnit } from './getSafeUnit';

export const convertDistance = (
  distance: DistanceWellsSDK,
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
