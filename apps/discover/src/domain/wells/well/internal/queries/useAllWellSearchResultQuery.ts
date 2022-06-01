import { Well } from 'domain/wells/well/internal/types';

import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect } from 'hooks/useDeep';
import { useCommonWellFilter } from 'modules/wellSearch/hooks/useCommonWellFilter';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { getWells } from '../../service/network/getWells';
import { normalizeWells } from '../transformers/normalize';

export const useAllWellSearchResultQuery = (): UseQueryResult<Well[]> => {
  const { data: wellConfig } = useWellConfig();
  const wellFilter = useCommonWellFilter();
  const queryClient = useQueryClient();

  useDeepEffect(() => {
    queryClient.invalidateQueries(WELL_QUERY_KEY.ALL);
  }, [wellFilter]);

  return useQuery(
    WELL_QUERY_KEY.ALL,
    ({ signal }) => {
      return getWells(wellFilter, { signal }).then(normalizeWells);
    },
    {
      enabled: wellConfig?.disabled !== true,
    }
  );
};
