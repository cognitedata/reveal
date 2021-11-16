import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const PageContent: React.FC = ({ children }) => {
  return <Container>{children}</Container>;
};
