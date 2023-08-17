import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

type BoxProps = {
  children: React.ReactNode;
  className?: string;
};

export const Box = ({ children, className }: BoxProps): JSX.Element => {
  return <Container className={className}>{children}</Container>;
};

const Container = styled.div`
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  background: ${Colors['surface--muted']};
`;
