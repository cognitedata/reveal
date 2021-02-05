import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';
import { Splitter } from './Splitter';

export default { title: 'Component/Splitter', component: Splitter };

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
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => setVisible(!visible)}>Change Visiblity</Button>
      <Container>
        <Splitter>
          <div>
            <Title>1</Title>
          </div>
          {visible && (
            <div>
              <Title>2</Title>
            </div>
          )}
        </Splitter>
      </Container>
    </>
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
