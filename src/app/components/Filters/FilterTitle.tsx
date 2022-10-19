import { Body } from '@cognite/cogs.js';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

export const Title = styled(Body).attrs({ strong: true, level: 2 })`
  padding-bottom: 6px;
  padding-top: 12px;
`;

export const FilterTitle: React.FC<PropsWithChildren> = ({ children }) => {
  return <Title>{children}</Title>;
};
