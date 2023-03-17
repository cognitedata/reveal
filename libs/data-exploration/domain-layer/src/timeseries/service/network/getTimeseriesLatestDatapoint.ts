import { CogniteClient, LatestDataBeforeRequest } from '@cognite/sdk/dist/src';
import chunk from 'lodash/chunk';
import { MAX_RESULT_LIMIT_DATAPOINTS } from '../../../constants';

export const getTimeseriesLatestDatapoint = (
  sdk: CogniteClient,
  items: LatestDataBeforeRequest[]
) => {
  const chunkTimeseriesIds = chunk(items, MAX_RESULT_LIMIT_DATAPOINTS);

  const chunkedPromises = chunkTimeseriesIds.map((timeseriesIds) =>
    sdk.datapoints.retrieveLatest(timeseriesIds)
  );
  return Promise.all(chunkedPromises).then((result) => result.flat());
};
