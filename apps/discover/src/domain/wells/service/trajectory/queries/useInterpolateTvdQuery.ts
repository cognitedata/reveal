import { normalizeTvd } from 'domain/wells/dataLayer/trajectory/adapters/normalizeTvd';
import { GroupedTvdData } from 'domain/wells/dataLayer/trajectory/types';
import { groupByWellbore } from 'domain/wells/dataLayer/wellbore/adapters/groupByWellbore';

import { useQuery } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { TrajectoryInterpolationRequest } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { SOMETHING_WENT_WRONG_FETCHING_TVD } from '../constants';
import { getInterpolateTvd } from '../network/getInterpolateTvd';
import { ResponseItemType } from '../types';

export const useInterpolateTvdQuery = (
  responseItems: ResponseItemType[],
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
) => {
  return useQuery<GroupedTvdData>(
    [WELL_QUERY_KEY.TRAJECTORIES_INTERPOLATE, trajectoryInterpolationRequests],
    () =>
      getInterpolateTvd(responseItems, trajectoryInterpolationRequests)
        .then((tvd) => tvd.map(normalizeTvd))
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, SOMETHING_WENT_WRONG_FETCHING_TVD)
        )
  );
};
