import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { sequences } from 'stubs/sequences';
import { ComponentStory } from '@storybook/react';
import { SequenceTable } from './SequenceTable';

export default {
  title: 'Sequences/SequenceTable',
  component: SequenceTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof SequenceTable> = args => (
  <SequenceTable {...args} />
);
Example.args = {
  items: sequences,
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect: ComponentStory<
  typeof SequenceTable
> = args => <SequenceTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  items: sequences,
  onItemClicked: action('onItemClicked'),
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
