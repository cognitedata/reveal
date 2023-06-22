import React from 'react';

import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

interface ColumnTitleProps {
  children: React.ReactNode;
}

const StyledColumnTitle = styled(Body)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;
export const ColumnTitle = ({ children }: ColumnTitleProps) => (
  <StyledColumnTitle level={2}>{children}</StyledColumnTitle>
);
