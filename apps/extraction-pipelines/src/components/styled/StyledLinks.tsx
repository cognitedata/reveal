import styled from 'styled-components';
import React from 'react';
import { NavLink } from 'react-router-dom';

export const LinkWrapper = styled.div`
  grid-area: links;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
  margin-right: 2rem;
`;

export const StyledLink = styled((props) => <a {...props}>{props.children}</a>)`
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
