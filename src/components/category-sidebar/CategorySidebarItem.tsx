import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button, Chip } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CATEGORY_SEARCH_PARAM_KEY } from 'common';

type CategorySidebarItemProps = {
  count?: number;
  isLoading?: boolean;
  tab: string;
  title: string;
};

const CategorySidebarItem = ({
  count,
  tab,
  title,
}: CategorySidebarItemProps): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamCategory = searchParams.get(CATEGORY_SEARCH_PARAM_KEY) ?? '';

  const handleClick = (): void => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set(CATEGORY_SEARCH_PARAM_KEY, tab);
    setSearchParams(urlSearchParams, { replace: true });
  };

  return (
    <StyledButton
      onClick={handleClick}
      toggled={searchParamCategory === tab}
      type="ghost"
    >
      <span>{title}</span>
      {count && <Chip label={count} muted size="x-small" />}
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
