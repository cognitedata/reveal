import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { useSelectedSiteConfig } from '../../../../hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { buildTimeseriesFilter } from '../../../../utils/filterBuilder';
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
