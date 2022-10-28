import { NdsWithTvd } from 'domain/wells/nds/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TvdDataWithMdIndex } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';

import { Nds } from '@cognite/sdk-wells';

export const mergeNdsTvdData = (
  nds: Nds,
  trueVerticalDepths: TvdDataWithMdIndex
): NdsWithTvd => {
  const tvdData: Partial<NdsWithTvd> = {};

  const { holeTop, holeBase } = nds;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeTop) {
    const holeTopTvdValue = getTvdForMd(holeTop, trueVerticalDepths);

    if (!isUndefined(holeTopTvdValue)) {
      tvdData.holeTopTvd = { value: holeTopTvdValue, unit };
    }
  }

  if (holeBase) {
    const holeBaseTvdValue = getTvdForMd(holeBase, trueVerticalDepths);

    if (!isUndefined(holeBaseTvdValue)) {
      tvdData.holeBaseTvd = { value: holeBaseTvdValue, unit };
    }
  }

  return {
    ...nds,
    ...tvdData,
  };
};
