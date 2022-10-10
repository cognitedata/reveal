import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useQuery } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { TrajectoryInterpolationRequest } from '@cognite/sdk-wells';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { SOMETHING_WENT_WRONG_FETCHING_TVD } from '../../constants';
import { getInterpolateTvd } from '../../service/network/getInterpolateTvd';
import { ResponseItemType } from '../../service/types';
import { addMdIndex } from '../transformers/addMdIndex';
import { GroupedTvdData } from '../types';

export const useInterpolateTvdQuery = (
  responseItems: ResponseItemType[],
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
) => {
  return useQuery<GroupedTvdData>(
    [WELL_QUERY_KEY.TRAJECTORIES_INTERPOLATE, trajectoryInterpolationRequests],
    () =>
      getInterpolateTvd(responseItems, trajectoryInterpolationRequests)
        .then((tvd) => tvd.map(addMdIndex))
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, SOMETHING_WENT_WRONG_FETCHING_TVD)
        )
  );
};
