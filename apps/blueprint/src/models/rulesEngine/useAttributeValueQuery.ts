import { useContext } from 'react';
import { useQuery } from 'react-query';
import { Asset, Timeseries } from '@cognite/sdk';
import { AuthContext } from 'providers/AuthProvider';
import { ShapeAttribute } from 'typings';

import { resolveAttributeValueFromResource } from './api';

export const useAttributeValueQuery = (
  attribute: ShapeAttribute,
  resource?: Asset | Timeseries
) => {
  const { client } = useContext(AuthContext);

  const query = useQuery<string | number, Error>(
    ['timeSeries', attribute, resource],
    () => {
      if (!attribute || !resource) {
        throw new Error('Unreachable code');
      }
      return resolveAttributeValueFromResource(client, attribute, resource);
    },
    {
      enabled: Boolean(attribute && resource),
      retry: false,
    }
  );
  return query;
};
