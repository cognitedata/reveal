import { type CogniteClient, type IdEither, type Datapoints } from '@cognite/sdk';
import { executeParallel } from '../../utilities/executeParallel';
import { isDefined } from '../../utilities/isDefined';
import { chunk } from 'lodash';

const FETCH_CHUNK = 100;

export const getTimeseriesLatestDatapoints = async (
  sdk: CogniteClient,
  timeseriesIds: IdEither[]
): Promise<Datapoints[]> => {
  const timeseriesChunks = chunk(timeseriesIds, FETCH_CHUNK);

  const timeseriesDatapoints = await executeParallel(
    timeseriesChunks.map(
      (timeseriesIds) => async () => await sdk.datapoints.retrieveLatest(timeseriesIds)
    ),
    2
  );

  const cleanDatapoints = timeseriesDatapoints.filter(isDefined).flat();
  return cleanDatapoints;
};
