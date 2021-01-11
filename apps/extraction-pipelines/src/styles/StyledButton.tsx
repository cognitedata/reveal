import styled from 'styled-components';
import { Button, Colors } from '@cognite/cogs.js';
import React from 'react';

export const NoStyleBtn = styled((props) => (
  <Button variant="ghost" {...props}>
    {props.children}
  </Button>
))`
  &.cogs-btn-secondary {
    &.cogs-btn-ghost {
      padding: 0;
      &:hover,
      &:focus {
        background-color: ${Colors.white.hex()};
      }
    }
  }
`;
