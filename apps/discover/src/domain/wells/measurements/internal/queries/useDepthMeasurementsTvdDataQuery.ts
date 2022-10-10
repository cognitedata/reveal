import { useInterpolateTvdQuery } from 'domain/wells/trajectory/internal/queries/useInterpolateTvdQuery';
import { getKeyedTvdData } from 'domain/wells/trajectory/internal/transformers/getKeyedTvdData';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getInterpolateRequests } from '../../service/utils/getInterpolateRequests';
import { DepthMeasurementWithData } from '../types';

export const useDepthMeasurementsTvdDataQuery = (
  depthMeasurements: DepthMeasurementWithData[]
) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const interpolateRequests = getInterpolateRequests(
    depthMeasurements,
    userPreferredUnit
  );

  const { data, ...rest } = useInterpolateTvdQuery(
    depthMeasurements,
    interpolateRequests
  );

  return {
    data: data && getKeyedTvdData(data),
    ...rest,
  };
};
