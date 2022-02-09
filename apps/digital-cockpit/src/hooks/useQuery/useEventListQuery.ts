import { useContext } from 'react';
import { useQuery } from 'react-query';
import { CogniteEvent, EventFilterRequest } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

// These types of events are internal and should not be shown to the user
const TYPE_BLACKLIST = [
  'inspector', // Bestday
  'cognite_annotation', // Cognite annotations
];

const useEventListQuery = (scope: EventFilterRequest) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<CogniteEvent[]>(
    ['eventsList', scope],
    () => {
      return client
        .post(`/api/v1/projects/${client.project}/events/list`, {
          data: {
            ...scope,
            advancedFilter: {
              not: {
                in: {
                  property: ['type'],
                  values: TYPE_BLACKLIST,
                },
              },
            },
          },
          headers: {
            'cdf-version': 'alpha',
          },
        })
        .then((res) => res.data.items as CogniteEvent[]);
      return client.events.list(scope).then((res) => res.items);
    },
    {
      enabled: Boolean(scope),
    }
  );
  return query;
};

export default useEventListQuery;
