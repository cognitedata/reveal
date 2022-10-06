import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Title = styled(Body).attrs({ strong: true, level: 2 })`
  padding-bottom: 5px;
  padding-top: 10px;
`;

export const FilterFacetTitle: React.FC = ({ children }) => {
  return <Title>{children}</Title>;
};
