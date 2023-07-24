import compact from 'lodash/compact';

import { CogniteClient } from '@cognite/sdk';

import {
  TimeseriesSingleAggregate,
  TimeseriesSingleAggregateMultiQuery,
} from '../types';

import { getTimeseriesSingleAggregate } from './getTimeseriesSingleAggregate';

export const getTimeseriesSingleAggregateMulti = (
  sdk: CogniteClient,
  query: TimeseriesSingleAggregateMultiQuery
): Promise<TimeseriesSingleAggregate[]> => {
  const { items, ...rest } = query;

  return Promise.allSettled(
    items.map((item) => {
      return getTimeseriesSingleAggregate(sdk, {
        ...item,
        ...rest,
      });
    })
  )
    .then((results) => {
      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });
    })
    .then(compact)
    .catch(() => {
      return [];
    });
};
