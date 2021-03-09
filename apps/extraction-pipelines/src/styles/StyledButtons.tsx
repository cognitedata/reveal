import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import React from 'react';
import { NavLink } from 'react-router-dom';

export const StyledLink = styled((props) => <a {...props}>{props.children}</a>)`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
export const StyledNavLink = styled(NavLink)`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
