import styled from 'styled-components/macro';
import { ResourceType } from '@data-exploration-components/types';
import { Chip } from '@cognite/cogs.js';
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
    <Chip
      type="neutral"
      label={getSearchResultCountLabel(loadedCount, totalCount, resourceType)}
    />
  );
};
