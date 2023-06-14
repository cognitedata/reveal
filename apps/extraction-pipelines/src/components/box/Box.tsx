import { Colors, Elevations } from '@cognite/cogs.js';
import React from 'react';

import styled from 'styled-components';

type BoxProps = {
  children: React.ReactNode;
  className?: string;
};

export const Box = ({ children, className }: BoxProps): JSX.Element => {
  return <Container className={className}>{children}</Container>;
};

const Container = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
`;
