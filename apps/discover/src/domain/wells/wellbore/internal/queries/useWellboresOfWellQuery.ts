import { useQuery, UseQueryResult } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useAddToWellboresCache } from 'modules/wellSearch/hooks/useAddToWellboresCache';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { getWellboresByWellIds } from '../../service/network/getWellboresByWellId';
import { handleWellboreFetchServiceError } from '../../service/utils/handleWellboreFetchServiceError';
import { normalizeWellbores } from '../transformers/normalizeWellbores';
import { WellboreInternal } from '../types';

export type WellSearchResult = {
  wellbores: WellboreInternal[];
};
export const useWellboresOfWellQuery = (
  wellId: string,
  wellName: string
): UseQueryResult<WellSearchResult> => {
  const { data: wellConfig } = useWellConfig();
  const addToWellboresCache = useAddToWellboresCache();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useQuery(
    [WELL_QUERY_KEY.WELLBORES([wellId]), userPreferredUnit],
    () => {
      return getWellboresByWellIds([wellId])
        .then((wellbores) => {
          const normalizedWellbores = normalizeWellbores(
            wellName,
            wellbores,
            userPreferredUnit
          );
          addToWellboresCache(normalizedWellbores);
          return { wellbores: normalizedWellbores };
        })
        .catch(handleWellboreFetchServiceError);
    },
    {
      enabled: wellConfig?.disabled !== true,
    }
  );
};
