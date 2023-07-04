import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { buildTimeseriesFilter } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';
import { getTimeseriesAggregate } from '../network/getTimeseriesAggregate';

export const useTimeseriesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const [query] = useSearchQueryParams();
  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');

  return useQuery(
    queryKeys.aggregateTimeseries(query, timeseriesFilterParams),
    async () => {
      const response = await getTimeseriesAggregate(
        sdk,
        query,
        buildTimeseriesFilter(timeseriesFilterParams)
      );

      return response?.items?.[0]?.count;
    }
  );
};
