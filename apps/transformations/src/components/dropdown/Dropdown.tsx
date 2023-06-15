import styled from 'styled-components';

import { ZIndexLayer } from '@transformations/common';
import { getContainer } from '@transformations/utils';

import {
  Button,
  Colors,
  Dropdown as CogsDropdown,
  DropdownProps as CogsDropdownProps,
  Menu,
} from '@cognite/cogs.js';

type DropdownProps = CogsDropdownProps;

const Dropdown = (props: DropdownProps): JSX.Element => {
  return (
    <CogsDropdown
      appendTo={getContainer()}
      zIndex={ZIndexLayer.Dropdown}
      {...props}
    />
  );
};

const StyledDropdownMenuButton = styled(Button)`
  && {
    justify-content: flex-start;
  }
`;

const StyledDropdownDivider = styled.div`
  :not(:last-child):not(:first-child) {
    background-color: ${Colors['border--status-undefined--muted']};
    height: 1px;
    margin: 8px -8px;
    width: calc(100% + 16px);
  }
`;

Dropdown.Menu = Menu;
Dropdown.Button = StyledDropdownMenuButton;
Dropdown.Divider = StyledDropdownDivider;

export default Dropdown;
