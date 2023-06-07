import React from 'react';

import styled from 'styled-components';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

export const PreviewFilterDropdown: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  return (
    <Dropdown content={<StyledMenu>{children as any}</StyledMenu>}>
      <Button icon="Filter" iconPlacement="right"></Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  min-width: 300px;
  max-width: 300px;
  padding: 16px !important;
`;
