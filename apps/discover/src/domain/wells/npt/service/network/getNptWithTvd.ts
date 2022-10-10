import { addMdIndex } from 'domain/wells/trajectory/internal/transformers/addMdIndex';
import { getInterpolateTvd } from 'domain/wells/trajectory/service/network/getInterpolateTvd';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { NptWithTvd } from '../../internal/types';
import { getInterpolateRequests } from '../utils/getInterpolateRequests';
import { mergeNptTvdData } from '../utils/mergeNptTvdData';

import { getNptEvents } from './getNptEvents';

export const getNptWithTvd = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps): Promise<NptWithTvd[]> => {
  const nptResponse = await getNptEvents({ wellboreIds, options });

  const interpolateRequests = getInterpolateRequests(nptResponse);
  const tvdResponse = await getInterpolateTvd(nptResponse, interpolateRequests)
    .then((tvd) => tvd.map(addMdIndex))
    .then(keyByWellbore);

  return nptResponse.map((npt) => {
    const { wellboreMatchingId } = npt;
    const trueVerticalDepths = tvdResponse[wellboreMatchingId];

    if (!trueVerticalDepths) {
      return npt;
    }

    return mergeNptTvdData(npt, trueVerticalDepths);
  });
};
