import { IdEither } from '@cognite/sdk';

export const getIdEither = <T extends IdEither>(item: T): IdEither => {
  if ('id' in item) {
    return { id: item.id };
  }

  return { externalId: item.externalId };
};
