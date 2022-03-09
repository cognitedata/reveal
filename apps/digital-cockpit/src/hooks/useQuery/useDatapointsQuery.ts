import { useQuery, UseQueryOptions } from 'react-query';
import { DatapointAggregates, Datapoints, DatapointsQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

export type useDatapointsQueryOptions = UseQueryOptions<
  DatapointAggregates[] | Datapoints[]
> & {
  latestOnly?: boolean;
  limit?: number;
};

const useDatapointsQuery = (
  references?: DatapointsQuery[],
  options?: useDatapointsQueryOptions
) => {
  const { latestOnly, limit, ...rest } = options || {};
  const { client } = useCDFExplorerContext();

  const query = useQuery<DatapointAggregates[] | Datapoints[]>(
    ['datapointsQuery', references, options],
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
        items: references,
        limit: options?.limit,
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
