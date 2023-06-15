import React from 'react';

import styled from 'styled-components';

import { DivFlex } from '@extraction-pipelines/components/styled';

export const CenterFullVH = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const PriSecBtnWrapper = styled((props) => (
  <DivFlex justify="end" {...props}>
    {props.children}
  </DivFlex>
))`
  margin-top: 1rem;
  .cogs-btn-primary {
    margin-left: 0.5rem;
  }
`;

export const CountSpan = styled((props) => (
  <span {...props}>{props.children}</span>
))`
  align-self: flex-start;
`;
