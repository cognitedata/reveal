import React from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';
import { Splitter } from './Splitter';

export default { title: 'Molecules/Splitter' };

export const Example = () => {
  return (
    <Container>
      <Splitter>
        <div>
          <Title>1</Title>
        </div>
        <div>
          <Title>2</Title>
        </div>
      </Splitter>
    </Container>
  );
};
export const ExampleHide = () => {
  return (
    <Container>
      <Splitter hide={[1]} flex={[0]}>
        <div>
          <Title>1</Title>
        </div>
        <div>
          <Title>2</Title>
        </div>
      </Splitter>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  width: 600px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;
`;
