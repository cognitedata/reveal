import { IdEither } from '@cognite/sdk';

export const getDataRevision = <T extends IdEither>(item: T) => {
  if ('id' in item) {
    return item.id;
  }

  return item.externalId;
};
