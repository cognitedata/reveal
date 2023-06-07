import chunk from 'lodash/chunk';

import { CogniteClient, IdEither } from '@cognite/sdk';

import { DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT } from '../../../constants';

export const getTimeseriesByIds = (sdk: CogniteClient, ids: IdEither[]) => {
  const chunkedTimeseriesIds = chunk(
    ids,
    DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT
  );
  const chunkedPromises = chunkedTimeseriesIds.map((timeseriesIds) =>
    sdk.timeseries.retrieve(timeseriesIds, { ignoreUnknownIds: true })
  );
  return Promise.all(chunkedPromises).then((result) => result.flat());
};
