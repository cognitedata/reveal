import { IdEither } from '@cognite/sdk';

export const getDataRevision = <T extends IdEither>(items: T[]) => {
  return items
    .map((item) => {
      if ('id' in item) {
        return item.id;
      }
      return item.externalId;
    })
    .join(',');
};
