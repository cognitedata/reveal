import React from 'react';
import styled from 'styled-components';
import { CountLabel } from './CountLabel';

export default { title: 'Atoms|CountLabel' };

export const Example = () => (
  <Container>
    <CountLabel value="25" />
    <CountLabel value="1312" />
    <CountLabel value="13/18" color="black" backgroundColor="yellow" />
  </Container>
);

const Container = styled.div`
  padding: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
`;
