import React from 'react';
import { ResourceType } from '@data-exploration-components/types';
import { Label } from '@cognite/cogs.js';
import { getSearchResultCountLabel } from '@data-exploration-components/utils/string';

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
    <Label variant="normal">
      {getSearchResultCountLabel(loadedCount, totalCount, resourceType)}
    </Label>
  );
};
