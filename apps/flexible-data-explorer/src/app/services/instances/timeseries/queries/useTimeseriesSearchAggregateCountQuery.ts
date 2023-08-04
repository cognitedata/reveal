import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { useProjectConfig } from '../../../../hooks/useProjectConfig';
import { buildTimeseriesFilter } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';
import { getTimeseriesAggregate } from '../network/getTimeseriesAggregate';

export const useTimeseriesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const config = useProjectConfig();

  const [query] = useSearchQueryParams();
  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');
  const filter = useMemo(
    () => buildTimeseriesFilter(timeseriesFilterParams, config),
    [timeseriesFilterParams, config]
  );

  return useQuery(queryKeys.aggregateTimeseries(query, filter), async () => {
    const response = await getTimeseriesAggregate(sdk, query, filter);

    return response?.items?.[0]?.count;
  });
};
