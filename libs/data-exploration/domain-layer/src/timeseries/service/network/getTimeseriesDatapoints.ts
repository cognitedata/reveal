import isEmpty from 'lodash/isEmpty';

import { CogniteClient, DatapointsMultiQuery } from '@cognite/sdk/dist/src';

import { MAX_RESULT_LIMIT_DATAPOINTS } from '../../../constants';

export const getTimeseriesDatapoints = (
  sdk: CogniteClient,
  { items, ...query }: DatapointsMultiQuery,
  limit: number = MAX_RESULT_LIMIT_DATAPOINTS
) => {
  return sdk.datapoints
    .retrieve({ items, limit, ...query })
    .then((items) => {
      if (isEmpty(items)) {
        return [];
      }

      return items;
    })
    .catch(() => {
      return [];
    });
};
