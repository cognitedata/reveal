import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  argTypes: {
    query: { control: 'text' },
    showDatePicker: { control: 'boolean' },
  },
};

export const Example: ComponentStory<typeof TimeseriesSearchResults> = args => (
  <Container>
    <TimeseriesSearchResults {...args} />
  </Container>
);

Example.args = {
  showDatePicker: true,
  showCount: true,
};

const Container = styled.div`
  height: 800px;
`;
