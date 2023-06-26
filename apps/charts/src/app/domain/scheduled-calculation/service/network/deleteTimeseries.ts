import { CogniteClient, IdEither } from '@cognite/sdk';

export const deleteTimeseries = (ids: IdEither[], sdk: CogniteClient) => {
  return sdk.timeseries.delete(ids);
};
