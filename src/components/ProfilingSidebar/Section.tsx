import React from 'react';
import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

type Props = { children: React.ReactNode; isHalf?: boolean };

export const Section = ({ children, isHalf = false }: Props): JSX.Element => {
  return <StyledSection isHalf={isHalf}>{children}</StyledSection>;
};

const StyledSection = styled.div.attrs(({ isHalf }: { isHalf?: boolean }) => {
  const style: React.CSSProperties = {
    width: isHalf ? '50%' : '100%',
  };
  return { style };
})<{ isHalf?: boolean }>`
  display: flex;
  height: auto;
  padding: 12px;
  box-sizing: border-box;
  background-color: ${Colors['greyscale-grey1'].hex()};
  border-radius: 8px;
`;
