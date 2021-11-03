import { Body, Button, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 3.25rem;
  /* background-color: red; */
  border-radius: 6px;

  margin-bottom: 5px;

  padding: 8px 12px;
`;

const ClassifierList: React.FC = () => {
  const items = [1, 2, 3];

  return (
    <>
      {items.map((item) => (
        <Wrapper>
          <Body level={2}>{item}</Body>
        </Wrapper>
      ))}
    </>
  );
};

const ClassifierAdd: React.FC = () => {
  return (
    <Button icon="PlusCompact" type="ghost">
      New classifier
    </Button>
  );
};

export const ClassifierWidget: React.FC = () => {
  return (
    <>
      <Title level={4}>Classifiers</Title>
      <ClassifierList />
      <ClassifierAdd />
    </>
  );
};

export default ClassifierWidget;
