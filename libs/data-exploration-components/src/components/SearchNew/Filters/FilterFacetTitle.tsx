import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Title = styled(Body).attrs({ strong: true, level: 2 })`
  padding-bottom: 6px;
  padding-top: 12px;
`;

export const FilterFacetTitle: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  return <Title>{children}</Title>;
};
