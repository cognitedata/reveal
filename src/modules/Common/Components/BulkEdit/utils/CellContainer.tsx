import React from 'react';
import styled from 'styled-components';

export const CellContainer = ({ children }: { children: any }) => (
  <Container>{children}</Container>
);

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
  padding: 2px;
`;
