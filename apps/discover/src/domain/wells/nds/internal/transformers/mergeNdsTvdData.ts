import {
  NdsInternal,
  NdsInternalWithTvd,
} from 'domain/wells/nds/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

export const mergeNdsTvdData = (
  nds: NdsInternal,
  trueVerticalDepths: TrueVerticalDepthsDataLayer
): NdsInternalWithTvd => {
  const tvdData: Partial<NdsInternalWithTvd> = {};

  const { holeStart, holeEnd } = nds;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeStart) {
    const holeStartTvdValue = getTvdForMd(holeStart, trueVerticalDepths);

    if (!isUndefined(holeStartTvdValue)) {
      tvdData.holeStartTvd = adaptToConvertedDistance(holeStartTvdValue, unit);
    }
  }

  if (holeEnd) {
    const holeEndTvdValue = getTvdForMd(holeEnd, trueVerticalDepths);

    if (!isUndefined(holeEndTvdValue)) {
      tvdData.holeEndTvd = adaptToConvertedDistance(holeEndTvdValue, unit);
    }
  }

  return {
    ...nds,
    ...tvdData,
  };
};
