import { Distance } from 'convert-units';
import { toNextHundred } from 'utils/number/toNextHundred';
import { changeUnitTo } from 'utils/units';

import { MaxDepthData } from '../types';

const DEFAULT_MAX_DEPTH = 10000;
const DEFAULT_MAX_DEPTH_UNIT: Distance = 'm';

export const getDefaultMaxDepthData = (
  wellboreMatchingId: string,
  depthUnit: Distance
): MaxDepthData => {
  const maxDepth = toNextHundred(
    changeUnitTo(DEFAULT_MAX_DEPTH, DEFAULT_MAX_DEPTH_UNIT, depthUnit)!
  );

  return {
    wellboreMatchingId,
    maxMeasuredDepth: maxDepth,
    maxTrueVerticalDepth: maxDepth,
    depthUnit,
  };
};
