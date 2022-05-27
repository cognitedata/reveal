import React from 'react';
import styled from 'styled-components';
import { EventSearchResults } from './EventSearchResults';

export default {
  title: 'Search Results/EventSearchResults',
  component: EventSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example = args => (
  <Container>
    <EventSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
