import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import React from 'react';

export const StyledLink = styled((props) => <a {...props}>{props.children}</a>)`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
