import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesAggregate } from '../network/getTimeseriesAggregate';
import { buildTimeseriesAdvancedFilter } from '../transformers';

export const useTimeseriesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();

  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');

  const advancedFilter = useMemo(
    () =>
      buildTimeseriesAdvancedFilter({
        params: timeseriesFilterParams,
        query,
        config: siteConfig,
      }),
    [timeseriesFilterParams, query, siteConfig]
  );

  return useQuery(
    queryKeys.aggregateTimeseries(query, advancedFilter),
    async () => {
      const response = await getTimeseriesAggregate(sdk, {
        advancedFilter,
      });

      return response?.items?.[0]?.count;
    }
  );
};
