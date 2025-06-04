import { type Timeseries, type CogniteClient, type IdEither } from '@cognite/sdk';
import { chunk } from 'lodash';
import { DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT } from '../../utilities/constants';

export const getTimeseriesByIds = async (
  sdk: CogniteClient,
  timeseriesIds: IdEither[]
): Promise<Timeseries[]> => {
  const chunkedTimeseriesIds = chunk(timeseriesIds, DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT);
  const chunkedPromises = chunkedTimeseriesIds.map(
    async (timeseriesIds) =>
      await sdk.timeseries.retrieve(timeseriesIds, { ignoreUnknownIds: true })
  );
  const result = await Promise.all(chunkedPromises);
  return result.flat();
};
