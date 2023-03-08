import {
  CogniteError,
  CogniteEvent,
  EventChange,
  CogniteClient,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryClient,
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

import { PropertyAggregate, PropertyAggregateResponse } from 'common/types';

export const useUpdateEvents = (
  options?: UseMutationOptions<CogniteEvent[], CogniteError, EventChange[]>
) => {
  const sdk = useSDK();

  return useMutation(
    ['update', 'events'],
    (changes) => {
      return sdk.events.update(changes);
    },
    options
  );
};

export const getPropertiesAggregateKey = (): QueryKey => [
  'events',
  'properties-aggregate',
];

/**
 * NOTE: metadata aggreates are always downcased since metadata filters are case-insensitive.
 */
export const getPropertiesAggregate = async (sdk: CogniteClient) => {
  const topLevelProperties: PropertyAggregate[] = [
    { values: [{ property: ['name'] }] },
    { values: [{ property: ['description'] }] },
    { values: [{ property: ['unit'] }] },
  ];
  return sdk
    .post<PropertyAggregateResponse>(
      `/api/v1/projects/${sdk.project}/events/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: { aggregate: 'uniqueProperties', path: ['metadata'] },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return [...topLevelProperties, ...r.data.items];
      } else {
        return Promise.reject(r);
      }
    });
};

export const fetchProperties = async (sdk: CogniteClient, qc: QueryClient) => {
  return qc.fetchQuery(getPropertiesAggregateKey(), () =>
    getPropertiesAggregate(sdk)
  );
};

export const useProperties = (
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getPropertiesAggregateKey(),
    () => getPropertiesAggregate(sdk),
    options
  );
};
