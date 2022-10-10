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

  const { holeStart, holeEnd } = nds;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeStart) {
    const holeStartTvdValue = getTvdForMd(holeStart, trueVerticalDepths);

    if (!isUndefined(holeStartTvdValue)) {
      tvdData.holeStartTvd = { value: holeStartTvdValue, unit };
    }
  }

  if (holeEnd) {
    const holeEndTvdValue = getTvdForMd(holeEnd, trueVerticalDepths);

    if (!isUndefined(holeEndTvdValue)) {
      tvdData.holeEndTvd = { value: holeEndTvdValue, unit };
    }
  }

  return {
    ...nds,
    ...tvdData,
  };
};
