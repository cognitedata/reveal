import { ComponentStory } from '@storybook/react';

import React from 'react';
import styled from 'styled-components';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  argTypes: {
    query: { control: 'text' },
  },
};

export const Example: ComponentStory<typeof TimeseriesSearchResults> = args => {
  return (
    <Container>
      <TimeseriesSearchResults {...args} />
    </Container>
  );
};

Example.args = {
  showCount: true,
};

const Container = styled.div`
  height: 800px;
`;
