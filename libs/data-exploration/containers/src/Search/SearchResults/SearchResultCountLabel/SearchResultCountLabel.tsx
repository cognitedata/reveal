import { Chip } from '@cognite/cogs.js';

import { ResourceType } from '@data-exploration-lib/core';

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
  return (
    <Chip
      type="neutral"
      hideTooltip
      label={getSearchResultCountLabel(loadedCount, totalCount, resourceType)}
    />
  );
};
