import { CogniteClient } from '@cognite/sdk/dist/src';
import { InternalThreedFilters } from '@data-exploration-lib/core';

export const list3DModelQuery = (
  sdk: CogniteClient,
  filters: InternalThreedFilters,
  limit = 1000,
  cursor?: string
) => {
  return sdk.models3D.list({ ...filters, limit, cursor });
};
