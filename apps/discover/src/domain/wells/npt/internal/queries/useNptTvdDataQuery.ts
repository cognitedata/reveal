import { useInterpolateTvdQuery } from 'domain/wells/trajectory/internal/queries/useInterpolateTvdQuery';
import { getKeyedTvdData } from 'domain/wells/trajectory/internal/transformers/getKeyedTvdData';

import { Npt } from '@cognite/sdk-wells';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getInterpolateRequests } from '../../service/utils/getInterpolateRequests';
import { NptInternal } from '../types';

export const useNptTvdDataQuery = (nptData: Npt[] | NptInternal[]) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const interpolateRequests = getInterpolateRequests(
    nptData,
    userPreferredUnit
  );

  const { data, ...rest } = useInterpolateTvdQuery(
    nptData,
    interpolateRequests
  );

  return {
    data: data && getKeyedTvdData(data),
    ...rest,
  };
};
