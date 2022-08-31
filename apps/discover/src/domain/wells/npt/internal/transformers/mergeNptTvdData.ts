import {
  NptInternal,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

export const mergeNptTvdData = (
  npt: NptInternal,
  trueVerticalDepths: TrueVerticalDepthsDataLayer
): NptInternalWithTvd => {
  const { measuredDepth } = npt;

  if (!measuredDepth) {
    return npt;
  }

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const trueVerticalDepth = getTvdForMd(measuredDepth, trueVerticalDepths);

  return {
    ...npt,
    trueVerticalDepth: !isUndefined(trueVerticalDepth)
      ? adaptToConvertedDistance(trueVerticalDepth, unit)
      : undefined,
  };
};
