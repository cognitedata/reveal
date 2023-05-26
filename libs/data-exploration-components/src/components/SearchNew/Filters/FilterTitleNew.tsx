import React, { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

export const Title = styled(Body).attrs({ strong: true, level: 2 })`
  padding-bottom: 6px;
  padding-top: 12px;
`;

export const FilterTitleNew: React.FC<PropsWithChildren> = ({ children }) => {
  return <Title>{children}</Title>;
};
