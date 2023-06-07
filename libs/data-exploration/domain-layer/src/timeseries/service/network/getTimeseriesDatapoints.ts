import chunk from 'lodash/chunk';

import { CogniteClient, DatapointsMultiQuery } from '@cognite/sdk/dist/src';

import { MAX_RESULT_LIMIT_DATAPOINTS } from '../../../constants';

export const getTimeseriesDatapoints = (
  sdk: CogniteClient,
  { items, ...query }: DatapointsMultiQuery
) => {
  const chunkTimeseriesIds = chunk(items, MAX_RESULT_LIMIT_DATAPOINTS);
  const chunkedPromises = chunkTimeseriesIds.map((timeseriesIds) =>
    sdk.datapoints.retrieve({ items: timeseriesIds, ...query })
  );
  return Promise.all(chunkedPromises).then((result) => result.flat());
};
