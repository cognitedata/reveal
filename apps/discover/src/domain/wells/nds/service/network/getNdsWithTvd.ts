import { addMdIndex } from 'domain/wells/trajectory/internal/transformers/addMdIndex';
import { getInterpolateTvd } from 'domain/wells/trajectory/service/network/getInterpolateTvd';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { NdsWithTvd } from '../../internal/types';
import { getInterpolateRequests } from '../utils/getInterpolateRequests';
import { mergeNdsTvdData } from '../utils/mergeNdsTvdData';

import { getNdsEvents } from './getNdsEvents';

export const getNdsWithTvd = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps): Promise<NdsWithTvd[]> => {
  const ndsResponse = await getNdsEvents({ wellboreIds, options });

  const interpolateRequests = getInterpolateRequests(ndsResponse);
  const tvdResponse = await getInterpolateTvd(ndsResponse, interpolateRequests)
    .then((tvd) => tvd.map(addMdIndex))
    .then(keyByWellbore);

  return ndsResponse.map((nds) => {
    const { wellboreMatchingId } = nds;
    const trueVerticalDepths = tvdResponse[wellboreMatchingId];

    if (!trueVerticalDepths) {
      return nds;
    }

    return mergeNdsTvdData(nds, trueVerticalDepths);
  });
};
