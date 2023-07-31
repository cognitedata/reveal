import { NptWithTvd } from 'domain/wells/npt/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TvdDataWithMdIndex } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';

import { Npt } from '@cognite/sdk-wells';

export const mergeNptTvdData = (
  npt: Npt,
  trueVerticalDepths: TvdDataWithMdIndex
): NptWithTvd => {
  const { measuredDepth } = npt;

  if (!measuredDepth) {
    return npt;
  }

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const trueVerticalDepth = getTvdForMd(measuredDepth, trueVerticalDepths);

  return {
    ...npt,
    trueVerticalDepth: isUndefined(trueVerticalDepth)
      ? undefined
      : { value: trueVerticalDepth, unit },
  };
};
