/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type IdEither, type Datapoints } from '@cognite/sdk';

export const getTimeseriesLatestDatapoints = async (
  sdk: CogniteClient,
  timeseriesIds: IdEither[]
): Promise<Datapoints[]> => {
  return await sdk.datapoints.retrieveLatest(timeseriesIds);
};
