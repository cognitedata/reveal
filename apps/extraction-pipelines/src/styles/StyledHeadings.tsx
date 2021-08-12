import React from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';

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
`;
export const StyledTitle2 = styled((props) => (
  <Title {...props} level={2}>
    {props.children}
  </Title>
))`
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;
export const StyledTitle3 = styled((props) => (
  <Title {...props} level={3}>
    {props.children}
  </Title>
))``;
