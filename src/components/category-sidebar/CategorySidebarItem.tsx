import React from 'react';

import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

type CategorySidebarItemProps = {
  count?: number;
  isLoading?: boolean;
  tab?: string;
  title: string;
};

const CategorySidebarItem = ({
  count,
  title,
}: CategorySidebarItemProps): JSX.Element => {
  const handleClick = (): void => {
    // set url param tab
  };

  return (
    <Button onClick={handleClick} type="ghost">
      <StyledContent>
        <span>{title}</span>
        <span>{count}</span>
      </StyledContent>
    </Button>
  );
};

const StyledContent = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export default CategorySidebarItem;
