import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { sequences } from 'stubs/sequences';
import { SequenceDetailsAbstract } from './SequenceDetailsAbstract';

export default {
  title: 'Sequences/Base/SequenceDetailsAbstract',
  component: SequenceDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <SequenceDetailsAbstract sequence={sequences[0]} />;
};

export const WithActions = () => {
  return (
    <SequenceDetailsAbstract
      sequence={sequences[0]}
      actions={[
        <Button key="1" type="primary">
          Click me
        </Button>,
        <Button key="2">Click me too</Button>,
      ]}
    />
  );
};
export const WithExtras = () => {
  return (
    <SequenceDetailsAbstract
      sequence={sequences[0]}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
    />
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;
