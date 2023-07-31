import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { changeUnitTo } from 'utils/units';
import { ConvertedDistance } from 'utils/units/constants';

import { Distance } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { TvdDataWithMdIndex } from '../types';

export const getTvdForMd = (
  measuredDepth: Distance | ConvertedDistance | number,
  trueVerticalDepths: TvdDataWithMdIndex,
  toFixed: Fixed = Fixed.ThreeDecimals,
  unit?: UserPreferredUnit
) => {
  const { mdTvdMap, trueVerticalDepthUnit } = trueVerticalDepths;

  const md = isNumber(measuredDepth) ? measuredDepth : measuredDepth.value;

  const tvd = mdTvdMap[md];

  if (isUndefined(tvd)) {
    return undefined;
  }

  const { unit: tvdUnit } = trueVerticalDepthUnit;

  if (!unit) {
    return toFixedNumberFromNumber(tvd, toFixed);
  }

  const convertedValue = changeUnitTo(tvd, tvdUnit, unit);

  if (isUndefined(convertedValue)) {
    return undefined;
  }

  return toFixedNumberFromNumber(convertedValue, toFixed);
};
