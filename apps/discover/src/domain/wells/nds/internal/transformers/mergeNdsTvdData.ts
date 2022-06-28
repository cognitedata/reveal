import {
  NdsInternal,
  NdsInternalWithTvd,
} from 'domain/wells/nds/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/transformers/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

export const mergeNdsTvdData = (
  nds: NdsInternal,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
): NdsInternalWithTvd => {
  const tvdData: Partial<NdsInternalWithTvd> = {};

  if (!trueVerticalDepths) {
    return nds;
  }

  const { holeStart, holeEnd } = nds;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeStart) {
    const holeStartTvdValue = getTvdForMd(
      holeStart,
      trueVerticalDepths,
      Fixed.NoDecimals
    );

    if (!isUndefined(holeStartTvdValue)) {
      tvdData.holeStartTvd = adaptToConvertedDistance(holeStartTvdValue, unit);
    }
  }

  if (holeEnd) {
    const holeEndTvdValue = getTvdForMd(
      holeEnd,
      trueVerticalDepths,
      Fixed.NoDecimals
    );

    if (!isUndefined(holeEndTvdValue)) {
      tvdData.holeEndTvd = adaptToConvertedDistance(holeEndTvdValue, unit);
    }
  }

  return {
    ...nds,
    ...tvdData,
  };
};
