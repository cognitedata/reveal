import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof TimeseriesSearchResults> = args => (
  <Container>
    <TimeseriesSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
