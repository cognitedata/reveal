import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { sequences } from 'stubs/sequences';
import { SequenceTable } from './SequenceTable';

export default {
  title: 'Sequences/SequenceTable',
  component: SequenceTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <SequenceTable
      items={sequences}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <SequenceTable
      selectionMode="single"
      items={sequences}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;
