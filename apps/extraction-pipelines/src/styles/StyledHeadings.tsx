import React from 'react';
import styled from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';

export const PageTitle = styled((props) => (
  <HeadingWithUnderline {...props} level={1}>
    {props.children}
  </HeadingWithUnderline>
))`
  font-size: 1.5rem;
`;

export const HeadingWithUnderline = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    background-color: ${Colors.warning.hex()};
    width: 3rem;
    height: 0.25rem;
    transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
  }
`;
