import React from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';

export const HeadingWithUnderline = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0px;
    background-color: rgb(255, 187, 0);
    width: 48px;
    height: 4px;
    transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
  }
`;
