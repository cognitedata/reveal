import React from 'react';
import styled from 'styled-components';
import { Dropdown, Menu, Button } from '@cognite/cogs.js';

type FileMenuProps = {
  options: React.ReactNode[];
};

export const FilterMenu = ({ options }: FileMenuProps): JSX.Element => {
  const filterMenu = (
    <StyledMenu>
      {options.map((option, index) => (
        <React.Fragment key={`menu-filter-${String(index)}`}>
          {option}
        </React.Fragment>
      ))}
    </StyledMenu>
  );

  return (
    <Dropdown content={filterMenu}>
      <Button icon="ChevronDown" iconPlacement="right">
        More filters
      </Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  & > :not(:last-child) {
    margin-bottom: 8px;
  }
`;
