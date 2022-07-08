import { WellInternal } from 'domain/wells/well/internal/types';

import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useWellFilterRequest } from 'modules/wellSearch/hooks/useWellFilterRequest';

import { getWells } from '../../service/network/getWells';
import { normalizeWell } from '../transformers/normalizeWell';

export const useAllWellSearchResultQuery = (): UseQueryResult<
  WellInternal[]
> => {
  const { data: wellConfig } = useWellConfig();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const wellFilter = useWellFilterRequest();
  const queryClient = useQueryClient();

  const key = [WELL_QUERY_KEY.ALL, userPreferredUnit];

  useDeepEffect(() => {
    queryClient.invalidateQueries(key);
  }, [wellFilter]);

  return useQuery(
    key,
    ({ signal }) => {
      return getWells(wellFilter, { signal }).then((wells) =>
        wells.map((rawWell) => normalizeWell(rawWell, userPreferredUnit))
      );
    },
    {
      enabled: wellConfig?.disabled !== true,
    }
  );
};
