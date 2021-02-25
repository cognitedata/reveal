import React from 'react';
import { Title, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

interface PageTitleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const StyledTitle = styled(Title)`
  font-weight: 700;
`;
const Line = styled.div`
  width: 36px;
  height: 4px;
  margin-top: 8px;
  background: ${Colors['pink-3'].hex()};
`;
export const PageTitle = ({ children, style }: PageTitleProps) => (
  <>
    <StyledTitle level={3} style={style}>
      {children}
    </StyledTitle>
    <Line />
  </>
);
