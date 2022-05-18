import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';
import { getTvdForMd } from 'domain/wells/dataLayer/trajectory/selectors/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/dataLayer/trajectory/types';

import isUndefined from 'lodash/isUndefined';
import { convertToDistance } from 'utils/units/convertToDistance';

import { NdsView } from '../types';

export const processNdsTvdData = (
  nds: NdsDataLayer,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
) => {
  const tvdData: Partial<NdsView> = {};

  if (!trueVerticalDepths) {
    return tvdData;
  }

  const { holeStart, holeEnd } = nds.original;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeStart) {
    const holeStartTvdValue = getTvdForMd(holeStart, trueVerticalDepths, 0);

    if (!isUndefined(holeStartTvdValue)) {
      tvdData.holeStartTvd = convertToDistance(holeStartTvdValue, unit);
    }
  }

  if (holeEnd) {
    const holeEndTvdValue = getTvdForMd(holeEnd, trueVerticalDepths, 0);

    if (!isUndefined(holeEndTvdValue)) {
      tvdData.holeEndTvd = convertToDistance(holeEndTvdValue, unit);
    }
  }

  return tvdData;
};
