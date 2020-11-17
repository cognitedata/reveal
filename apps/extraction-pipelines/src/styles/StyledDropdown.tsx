import styled from 'styled-components';
import { Colors, Dropdown } from '@cognite/cogs.js';
import React from 'react';

export const StyledDropdown = styled((props) => (
  <Dropdown {...props}>{props.children}</Dropdown>
))`
  .tippy-content {
    padding: 0;
    .cogs-menu-item {
      color: ${Colors.black.hex()};
    }
  }
`;
