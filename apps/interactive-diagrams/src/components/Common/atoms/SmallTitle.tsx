import React from 'react';

import styled from 'styled-components';

const StyledH3 = styled.h3`
  font-weight: bold;
  font-size: 16px;
  margin-top: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface SmallTitleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export const SmallTitle = ({ children, style }: SmallTitleProps) => (
  <StyledH3 style={style}>{children}</StyledH3>
);
