import React from 'react';

import styled from 'styled-components';

import { ComponentStory } from '@storybook/react';

import { EventSearchResults } from './EventSearchResults';

export default {
  title: 'Search Results/EventSearchResults',
  component: EventSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof EventSearchResults> = (args) => (
  <Container>
    <EventSearchResults {...args} />
  </Container>
);

Example.args = {
  showCount: true,
};

const Container = styled.div`
  height: 400px;
`;
