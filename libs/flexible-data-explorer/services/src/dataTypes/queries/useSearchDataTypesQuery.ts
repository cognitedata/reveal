import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { buildFilterByDataType } from '@fdx/shared/utils/filterBuilder';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../queryKeys';

export const useSearchDataTypesQuery = () => {
  const client = useFDM();
  const config = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();

  const transformedFilter = useMemo(() => {
    return buildFilterByDataType(filters, config);
  }, [filters, config]);

  return useQuery(
    queryKeys.searchDataTypes(query, transformedFilter),
    async () => {
      const results = await client.search(query, transformedFilter, config);

      return results;
    },
    {
      // enabled: types !== undefined,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
