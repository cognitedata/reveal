import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button, Chip } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CATEGORY_SEARCH_PARAM_KEY } from 'common';

export const EXTRACTOR_LIBRARY_CATEGORIES = {
  extractor: 'extractor',
  sourceSystem: 'source-system',
} as const;

export type ExtractorLibraryCategory =
  typeof EXTRACTOR_LIBRARY_CATEGORIES[keyof typeof EXTRACTOR_LIBRARY_CATEGORIES];

type CategorySidebarItemProps = {
  category?: ExtractorLibraryCategory;
  count?: number;
  isLoading?: boolean;
  title: string;
};

const CategorySidebarItem = ({
  category,
  count,
  isLoading,
  title,
}: CategorySidebarItemProps): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamCategory =
    searchParams.get(CATEGORY_SEARCH_PARAM_KEY) ?? undefined;

  const handleClick = (): void => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (category) {
      urlSearchParams.set(CATEGORY_SEARCH_PARAM_KEY, category);
    } else {
      urlSearchParams.delete(CATEGORY_SEARCH_PARAM_KEY);
    }
    setSearchParams(urlSearchParams, { replace: true });
  };

  return (
    <StyledButton
      loading={isLoading}
      onClick={handleClick}
      toggled={searchParamCategory === category}
      type="ghost"
    >
      <span>{title}</span>
      {count !== undefined && <Chip label={count} muted size="x-small" />}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  > span {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`;

export default CategorySidebarItem;
