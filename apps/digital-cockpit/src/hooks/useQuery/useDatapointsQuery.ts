import { useContext } from 'react';
import { useQuery } from 'react-query';
import { DatapointAggregates, Datapoints, DatapointsQuery } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

export type useDatapointsQueryOptions = {
  latestOnly?: boolean;
};

const useDatapointsQuery = (
  references: DatapointsQuery[],
  options?: useDatapointsQueryOptions
) => {
  const { client } = useContext(CogniteSDKContext);

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
      return client.datapoints.retrieve({ items: references });
    },
    {
      enabled: Boolean(references),
    }
  );
  return query;
};

export default useDatapointsQuery;
