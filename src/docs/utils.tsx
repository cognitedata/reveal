import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 600px;
  display: flex;
`;

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <Container>{children}</Container>;
};
