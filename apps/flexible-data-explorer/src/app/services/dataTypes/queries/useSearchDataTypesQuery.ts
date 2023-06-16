import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { buildFilterByDataType } from '../../../utils/filterBuilder';
import { useTypesDataModelQuery } from '../../dataModels/query/useTypesDataModelQuery';
import { queryKeys } from '../../queryKeys';

export const useSearchDataTypesQuery = () => {
  const client = useFDM();

  const { data: types } = useTypesDataModelQuery();

  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();

  const transformedFilter = useMemo(() => {
    return buildFilterByDataType(filters);
  }, [filters]);

  return useQuery(
    queryKeys.searchDataTypes(query, transformedFilter, client.getHeaders),
    async () => {
      const results = await client.searchDataTypes(
        query,
        transformedFilter,
        types
      );

      return results;
    },
    {
      enabled: types !== undefined,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
