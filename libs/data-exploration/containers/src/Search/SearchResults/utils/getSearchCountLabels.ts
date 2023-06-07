import {
  getTitle,
  ResourceType,
  withThousandSeparator,
  withThousandSeparatorStringExtended,
} from '@data-exploration-lib/core';

export const getSearchResultCountLabel = (
  loadedCount: number,
  totalCount: number | string,
  resourceType: ResourceType
): string => {
  return `${withThousandSeparator(
    loadedCount
  )} of ${withThousandSeparatorStringExtended(totalCount)} ${getTitle(
    resourceType,
    Number(totalCount) !== 1
  ).toLowerCase()}`;
};
