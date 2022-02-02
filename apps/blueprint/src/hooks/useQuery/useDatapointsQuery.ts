import { useContext } from 'react';
import { useQuery } from 'react-query';
import { DatapointAggregates, Datapoints, DatapointsQuery } from '@cognite/sdk';
import { AuthContext } from 'providers/AuthProvider';

export type useDatapointsQueryOptions = {
  latestOnly?: boolean;
};

const useDatapointsQuery = (
  references: DatapointsQuery[],
  options?: useDatapointsQueryOptions
) => {
  const { client } = useContext(AuthContext);
  const query = useQuery<DatapointAggregates[] | Datapoints[]>(
    ['datapointsQuery', references, options],
    () => {
      if (options?.latestOnly) {
        return client.datapoints.retrieveLatest(
          references.map((x) => ({
            before: 'now',
            ...x,
          }))
        );
      }
      return client.datapoints.retrieve({
        limit: 1000,
        items: references,
      });
    },
    {
      enabled: Boolean(references),
    }
  );
  return query;
};

export default useDatapointsQuery;
