import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { changeUnitTo } from 'utils/units';
import { ConvertedDistance } from 'utils/units/constants';

import { Distance } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { TrueVerticalDepthsDataLayer } from '../types';

export const getTvdForMd = (
  measuredDepth: Distance | ConvertedDistance | number,
  trueVerticalDepths: TrueVerticalDepthsDataLayer,
  toFixed?: Fixed,
  unit?: UserPreferredUnit
) => {
  const { mdTvdMap, trueVerticalDepthUnit } = trueVerticalDepths;

  const md = isNumber(measuredDepth) ? measuredDepth : measuredDepth.value;

  const tvd = mdTvdMap[md];

  const { unit: tvdUnit } = trueVerticalDepthUnit;

  if (!unit && tvd) {
    return toFixedNumberFromNumber(tvd, toFixed);
  }

  if (unit) {
    const convertedValue = changeUnitTo(tvd, tvdUnit, unit);
    if (!isUndefined(convertedValue)) {
      return toFixedNumberFromNumber(convertedValue, toFixed);
    }
  }

  return undefined;
};
