import React from 'react';
import styled from 'styled-components';
import { SmallTitle } from './SmallTitle';

export default { title: 'Atoms|SmallTitle' };

export const Example = () => (
  <Container>
    <SmallTitle>Hello there</SmallTitle>
  </Container>
);

const Container = styled.div`
  padding: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
`;
