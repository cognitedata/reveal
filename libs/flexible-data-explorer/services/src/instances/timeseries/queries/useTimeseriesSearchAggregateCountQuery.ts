import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { buildTimeseriesFilter } from '@fdx/shared/utils/filterBuilder';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesAggregate } from '../network/getTimeseriesAggregate';

export const useTimeseriesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();
  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');
  const filter = useMemo(
    () => buildTimeseriesFilter(timeseriesFilterParams, siteConfig),
    [timeseriesFilterParams, siteConfig]
  );

  return useQuery(queryKeys.aggregateTimeseries(query, filter), async () => {
    const response = await getTimeseriesAggregate(sdk, query, filter);

    return response?.items?.[0]?.count;
  });
};
