import isEmpty from 'lodash/isEmpty';

import { CogniteClient } from '@cognite/sdk';

import {
  TimeseriesDatapointsResponse,
  TimeseriesDatapointsQuery,
} from '../types';

export const getTimeseriesDatapoints = (
  sdk: CogniteClient,
  query: TimeseriesDatapointsQuery
): Promise<TimeseriesDatapointsResponse | undefined> => {
  const { item, ...rest } = query;

  return sdk.datapoints
    .retrieve({
      items: [item],
      ...rest,
    })
    .then((items) => {
      if (isEmpty(items)) {
        return undefined;
      }

      const { id, externalId, datapoints } = items[0];

      return {
        id,
        externalId,
        datapoints,
      };
    })
    .catch(() => {
      return undefined;
    });
};
