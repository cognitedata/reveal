import { IdEither } from '@cognite/sdk/dist/src';

export const pickOptionalId = (id?: IdEither) => (id ? pickId(id) : undefined);
export const pickId = (id: IdEither) =>
  'externalId' in id ? id.externalId : id.id;
