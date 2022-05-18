import { KeyedTvdData } from 'domain/wells/dataLayer/trajectory/types';

import head from 'lodash/head';

import { Nds } from '@cognite/sdk-wells-v3';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { useInterpolateTvdQuery } from '../../trajectory/queries/useInterpolateTvdQuery';
import { getInterpolateRequests } from '../utils/getInterpolateRequests';

export const useNdsTvdDataQuery = (ndsData: Nds[]) => {
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

  const processedData: KeyedTvdData = Object.keys(data).reduce(
    (tvdData, wellboreMatchingId) => {
      return {
        ...tvdData,
        [wellboreMatchingId]: head(data[wellboreMatchingId]),
      };
    },
    {}
  );

  return { data: processedData, ...rest };
};
