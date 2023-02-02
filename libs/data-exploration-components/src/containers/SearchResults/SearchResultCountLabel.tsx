import styled from 'styled-components/macro';
import { ResourceType } from '@data-exploration-components/types';
import { Flex, Label } from '@cognite/cogs.js';
import { getSearchResultCountLabel } from '@data-exploration-components/utils/string';
import { EllipsisText } from '@data-exploration-components/components';

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
      <StyledSpan>
        {getSearchResultCountLabel(loadedCount, totalCount, resourceType)}
      </StyledSpan>
    </Label>
  );
};

const StyledSpan = styled.span`
  min-width: 16px;
  display: block; /* Fallback for non-webkit */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  text-overflow: ellipsis;
`;
