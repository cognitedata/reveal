import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  width: 100%;
  overflow: scroll;
`;

export const PageContent: React.FC = ({ children }) => {
  return <Container>{children}</Container>;
};
