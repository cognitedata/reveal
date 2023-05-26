import React from 'react';

import styled from 'styled-components';

import { ComponentStory } from '@storybook/react';

import { SequenceSearchResults } from './SequenceSearchResults';

export default {
  title: 'Search Results/SequenceSearchResults',
  component: SequenceSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof SequenceSearchResults> = (args) => (
  <Container>
    <SequenceSearchResults {...args} />
  </Container>
);

Example.args = {
  showCount: true,
};

const Container = styled.div`
  height: 400px;
`;
