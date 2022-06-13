import { useInterpolateTvdQuery } from 'domain/wells/trajectory/internal/queries/useInterpolateTvdQuery';
import { getKeyedTvdData } from 'domain/wells/trajectory/internal/utils/getKeyedTvdData';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getInterpolateRequests } from '../../service/utils/getInterpolateRequests';
import { CasingSchematicInternal } from '../types';

export const useCasingsTvdDataQuery = (
  casingsData: CasingSchematicInternal[]
) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const interpolateRequests = getInterpolateRequests(
    casingsData,
    userPreferredUnit
  );

  const { data, ...rest } = useInterpolateTvdQuery(
    casingsData,
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
