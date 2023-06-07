import React from 'react';

import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

export const Title = styled(Body).attrs({ strong: true, level: 2 })`
  padding-bottom: 6px;
  padding-top: 12px;
`;

export const FilterLabel: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  return <Title data-testid="filter-label">{children}</Title>;
};
