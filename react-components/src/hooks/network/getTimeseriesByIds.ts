/*!
 * Copyright 2024 Cognite AS
 */
import { type Timeseries, type CogniteClient, type IdEither } from '@cognite/sdk';

export const getTimeseriesByIds = async (
  sdk: CogniteClient,
  timeseriesIds: IdEither[]
): Promise<Timeseries[]> => {
  return await sdk.timeseries.retrieve(timeseriesIds, { ignoreUnknownIds: true });
};
