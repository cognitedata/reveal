import { IdEither } from '@cognite/sdk';

export const pickOptionalId = (id?: IdEither) => (id ? pickId(id) : undefined);
export const pickId = (id: IdEither) =>
  'externalId' in id ? id.externalId : id.id;

export const extractUniqueIds = (ids: IdEither[]) => {
  const uniqueIdSet = new Set<number>();
  const externalIdSet = new Set<string>();

  ids.forEach(id => {
    if ('externalId' in id) {
      externalIdSet.add(id.externalId);
    } else if ('id' in id) {
      uniqueIdSet.add(id.id);
    }
  });
  const updatedIds = {
    uniqueIds: Array.from(uniqueIdSet).map(id => ({ id })),
    uniqueExternalIds: Array.from(externalIdSet).map(externalId => ({
      externalId,
    })),
  };
  return updatedIds;
};

export const getIdParam = (id: number | string) => {
  if (typeof id === 'string') {
    return { externalId: id };
  }
  return { id };
};
