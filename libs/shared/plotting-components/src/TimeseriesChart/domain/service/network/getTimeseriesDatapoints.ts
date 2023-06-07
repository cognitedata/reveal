import isEmpty from 'lodash/isEmpty';

import { CogniteClient } from '@cognite/sdk';

import { TimeseriesDatapoint, TimeseriesDatapointsQuery } from '../types';

export const getTimeseriesDatapoints = (
  sdk: CogniteClient,
  query: TimeseriesDatapointsQuery
): Promise<TimeseriesDatapoint[]> => {
  const { id, ...rest } = query;

  return sdk.datapoints
    .retrieve({
      items: [{ id }],
      ...rest,
    })
    .then((items) => {
      if (isEmpty(items)) {
        return [];
      }

      return items[0].datapoints;
    })
    .catch(() => {
      return [];
    });
};
