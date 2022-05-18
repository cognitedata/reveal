import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import { toFixedNumberFromNumber } from 'utils/number';
import { changeUnitTo } from 'utils/units';

import { Distance } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { TrueVerticalDepthsDataLayer } from '../types';

export const getTvdForMd = (
  measuredDepth: Distance | number,
  trueVerticalDepths: TrueVerticalDepthsDataLayer,
  toFixed?: number,
  unit?: UserPreferredUnit
) => {
  const { mdTvdMap, trueVerticalDepthUnit } = trueVerticalDepths;

  const md = isNumber(measuredDepth) ? measuredDepth : measuredDepth.value;

  const tvd = mdTvdMap[md];

  const { unit: tvdUnit } = trueVerticalDepthUnit;

  if (!unit) {
    return toFixedNumberFromNumber(tvd, toFixed);
  }

  const convertedValue = changeUnitTo(tvd, tvdUnit, unit);

  if (!isUndefined(convertedValue)) {
    return toFixedNumberFromNumber(convertedValue, toFixed);
  }

  return undefined;
};
