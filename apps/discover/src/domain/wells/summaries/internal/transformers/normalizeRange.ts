import { Unit } from 'convert-units';
import { changeUnitTo } from 'utils/units';

import { UserPreferredUnit } from 'constants/units';

const DEFAULT_MIN_LIMIT = 0;
const DEFAULT_MAX_LIMIT = 0;

export const normalizeRange = (
  range: [number | undefined, number | undefined],
  currentUnit: Unit,
  userPreferredUnit: UserPreferredUnit
): [number, number] => {
  const [min = DEFAULT_MIN_LIMIT, max = DEFAULT_MAX_LIMIT] = range;

  if (currentUnit === userPreferredUnit) {
    return [Math.floor(min), Math.ceil(max)];
  }

  const covertedMin =
    changeUnitTo(min, currentUnit, userPreferredUnit) || DEFAULT_MIN_LIMIT;

  const covertedMax =
    changeUnitTo(max, currentUnit, userPreferredUnit) || DEFAULT_MAX_LIMIT;

  return [Math.floor(covertedMin), Math.ceil(covertedMax)];
};
