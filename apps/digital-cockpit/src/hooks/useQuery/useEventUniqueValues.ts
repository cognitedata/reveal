import { useContext } from 'react';
import { useQuery } from 'react-query';
import { EventFilterRequest } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

// These types of events are internal and should not be shown to the user
const TYPE_BLACKLIST = [
  'inspector', // Bestday
  'cognite_annotation', // Cognite annotations
];

export type UniqueValue = {
  count: number;
  value: string;
};

const useEventUniqueValues = (field: string, scope: EventFilterRequest) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<UniqueValue[]>(
    ['eventUniqueValues', field, scope],
    () => {
      return client
        .post(`/api/v1/projects/${client.project}/events/aggregate`, {
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
            aggregate: 'uniqueValues',
            fields: [field],
          },
          headers: {
            'cdf-version': 'alpha',
          },
        })
        .then((res) => res.data.items as UniqueValue[]);
    },
    {
      enabled: Boolean(scope),
    }
  );
  return query;
};

export default useEventUniqueValues;
