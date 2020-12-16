import styled from 'styled-components';
import React from 'react';

export const WrapperMargin = styled.div`
  margin: 1rem;
`;
export const WrapperMarginCenterVH = styled((props) => (
  <WrapperMargin {...props}>{props.children}</WrapperMargin>
))`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CenterFullVH = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
