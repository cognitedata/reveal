import { useQuery, UseQueryOptions } from 'react-query';
import { DatapointAggregates, Datapoints, DatapointsQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import { calculateGranularity } from 'utils/timeseries';

export type useDatapointsQueryOptions = UseQueryOptions<
  DatapointAggregates[] | Datapoints[]
> & {
  latestOnly?: boolean;
  limit?: number;
  useAggregates?: boolean;
};

const useDatapointsQuery = (
  references?: DatapointsQuery[],
  options?: useDatapointsQueryOptions,
  domain?: number[]
) => {
  const { latestOnly, limit, ...rest } = options || {};
  const { client } = useCDFExplorerContext();

  const query = useQuery<DatapointAggregates[] | Datapoints[]>(
    ['datapointsQuery', references, options, domain],
    () => {
      if (!references) return [];
      if (options?.latestOnly) {
        return client.datapoints.retrieveLatest(
          references.map((x) => ({
            before: 'now',
            ...x,
          }))
        );
      }
      return client.datapoints.retrieve({
        items: references.map((ref) => ({
          ...ref,
          start: domain ? domain[0] : ref.start,
          end: domain ? domain[1] : ref.start,
        })),
        limit: options?.limit,
        granularity:
          options?.useAggregates && domain
            ? calculateGranularity(domain, options?.limit)
            : undefined,
        aggregates: options?.useAggregates ? ['average'] : undefined,
      });
    },
    {
      enabled: Boolean(references),
      ...rest,
    }
  );
  return query;
};

export default useDatapointsQuery;
