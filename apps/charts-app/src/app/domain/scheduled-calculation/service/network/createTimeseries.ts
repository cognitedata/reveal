import { CogniteClient, ExternalTimeseries } from '@cognite/sdk';

export const createTimeseries = (
  timeseries: ExternalTimeseries[],
  sdk: CogniteClient
) => {
  return sdk.timeseries.create(timeseries);
};
