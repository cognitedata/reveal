import {
  getTitle,
  getTranslationEntry,
  ResourceType,
  TFunction,
  withThousandSeparator,
  withThousandSeparatorStringExtended,
} from '@data-exploration-lib/core';

export const getSearchResultCountLabel = (
  loadedCount: number,
  totalCount: number,
  resourceType: ResourceType,
  t: TFunction
): string => {
  const loadedCountFormatted = withThousandSeparator(loadedCount);
  const totalCountFormatted = withThousandSeparatorStringExtended(totalCount);

  const titleTranslationKey = `${resourceType.toUpperCase()}_${getTranslationEntry(
    totalCount
  )}`;
  const title = getTitle(resourceType, totalCount !== 1);
  const titleTranslated = t(titleTranslationKey, title, {
    count: totalCount,
  }).toLowerCase();

  return t(
    'SEARCH_RESULTS_COUNT_LABEL',
    `${loadedCountFormatted} of ${totalCountFormatted} ${titleTranslated}`,
    {
      loaded: loadedCount,
      total: totalCount,
      resourceType: titleTranslated,
    }
  );
};
