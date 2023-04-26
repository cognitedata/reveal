import { CogniteClient } from '@cognite/sdk';

import isEmpty from 'lodash/isEmpty';

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
    });
};
