import React from 'react';

import { Button, Chip } from '@cognite/cogs.js';
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
    <StyledButton onClick={handleClick} type="ghost">
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
