import React from 'react';

import styled from 'styled-components';

import { Colors, Dropdown } from '@cognite/cogs.js';

export const StyledDropdown = styled((props) => (
  <Dropdown {...props}>{props.children}</Dropdown>
))`
  .tippy-content {
    padding: 0;
    .cogs-menu-item {
      color: ${Colors['decorative--grayscale--black']};
    }
  }
`;
