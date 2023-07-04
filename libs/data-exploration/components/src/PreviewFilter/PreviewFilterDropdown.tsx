import React from 'react';

import styled from 'styled-components';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

export const PreviewFilterDropdown: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [isMouseOnChildren, setIsMouseOnChildren] =
    React.useState<boolean>(false);

  return (
    <Dropdown
      visible={visible}
      content={
        <StyledMenu
          onMouseEnter={() => setIsMouseOnChildren(true)}
          onMouseLeave={() => setIsMouseOnChildren(false)}
        >
          {children as any}
        </StyledMenu>
      }
      onClickOutside={() => {
        if (!isMouseOnChildren) {
          setVisible(false);
        }
      }}
    >
      <Button
        icon="Filter"
        iconPlacement="right"
        onClick={() => setVisible((prevState) => !prevState)}
        aria-label="filter-dropdown-button"
      ></Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  min-width: 300px;
  max-width: 300px;
  padding: 16px !important;
`;
