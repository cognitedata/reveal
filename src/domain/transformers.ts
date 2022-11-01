/**
 * Tech debt: Remove me once api is shifted over to latest
 */
export const transformNewFilterToOldFilter = <T>(
  filter?: any
): T | undefined => {
  if (filter === undefined) {
    return undefined;
  }

  // TODO: Remove this when migrated
  if (filter.assetSubtreeIds) {
    filter = {
      ...filter,
      assetSubtreeIds: filter?.assetSubtreeIds?.map(({ value }: any) => ({
        id: value,
      })) as any,
    };
  }

  if (filter.dataSetIds) {
    filter = {
      ...filter,
      dataSetIds: filter?.dataSetIds?.map(({ value }: any) => ({
        id: value,
      })) as any,
    };
  }

  if (filter.labels) {
    filter = {
      ...filter,
      labels: {
        containsAny: filter?.labels?.map(({ value }: any) => ({
          externalId: value,
        })),
      },
    };
  }

  return filter as T;
};
