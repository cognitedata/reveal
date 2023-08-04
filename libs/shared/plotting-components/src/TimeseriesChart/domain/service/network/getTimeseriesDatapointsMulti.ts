import compact from 'lodash/compact';

import { CogniteClient } from '@cognite/sdk';

import {
  TimeseriesDatapointsResponse,
  TimeseriesDatapointsQuery,
} from '../types';

import { getTimeseriesDatapoints } from './getTimeseriesDatapoints';

export const getTimeseriesDatapointsMulti = (
  sdk: CogniteClient,
  queries: TimeseriesDatapointsQuery[]
): Promise<TimeseriesDatapointsResponse[]> => {
  return Promise.allSettled(
    queries.map((query) => {
      return getTimeseriesDatapoints(sdk, query);
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
