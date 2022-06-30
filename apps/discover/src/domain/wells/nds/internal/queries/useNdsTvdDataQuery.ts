import { useInterpolateTvdQuery } from 'domain/wells/trajectory/internal/queries/useInterpolateTvdQuery';
import { getKeyedTvdData } from 'domain/wells/trajectory/internal/transformers/getKeyedTvdData';

import { Nds } from '@cognite/sdk-wells-v3';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getInterpolateRequests } from '../../service/utils/getInterpolateRequests';
import { NdsInternal } from '../types';

export const useNdsTvdDataQuery = (ndsData: Nds[] | NdsInternal[]) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const interpolateRequests = getInterpolateRequests(
    ndsData,
    userPreferredUnit
  );

  const { data, ...rest } = useInterpolateTvdQuery(
    ndsData,
    interpolateRequests
  );

  if (!data) {
    return { data: {}, ...rest };
  }

  return {
    data: getKeyedTvdData(data),
    ...rest,
  };
};
