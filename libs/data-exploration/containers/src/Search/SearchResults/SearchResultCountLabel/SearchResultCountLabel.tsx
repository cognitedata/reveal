import { Chip } from '@cognite/cogs.js';

import { ResourceType, useTranslation } from '@data-exploration-lib/core';

import { getSearchResultCountLabel } from '../utils';

export const SearchResultCountLabel = ({
  loadedCount,
  totalCount,
  resourceType,
}: {
  loadedCount: number;
  totalCount: number | string;
  resourceType: ResourceType;
}) => {
  const { t } = useTranslation();

  return (
    <Chip
      type="neutral"
      hideTooltip
      label={getSearchResultCountLabel(
        loadedCount,
        Number(totalCount),
        resourceType,
        t
      )}
    />
  );
};
