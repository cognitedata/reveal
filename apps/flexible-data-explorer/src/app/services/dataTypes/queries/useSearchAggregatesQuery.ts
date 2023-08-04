import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { buildFilterByDataType } from '../../../utils/filterBuilder';
import { queryKeys } from '../../queryKeys';

export const useSearchAggregateQuery = () => {
  const client = useFDM();

  // const { data: types } = useTypesDataModelQuery();

  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();

  const transformedFilter = useMemo(() => {
    return buildFilterByDataType(filters);
  }, [filters]);

  return useQuery(
    queryKeys.searchAggregates(query, transformedFilter),
    async () => {
      const results = await client.searchAggregateCount(
        query,
        transformedFilter
      );

      return results;
    },
    {
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
