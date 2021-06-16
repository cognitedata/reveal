import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import React from 'react';
import { NavLink } from 'react-router-dom';

export const LinkWrapper = styled.div`
  grid-area: links;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 1.5rem 0;
  a,
  span {
    align-self: center;
    margin-right: 2rem;
  }
`;

export const StyledLink = styled((props) => <a {...props}>{props.children}</a>)`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
export const StyledNavLink = styled(NavLink)`
  &:hover {
    text-decoration: underline;
  }
`;
