import React from 'react';
import styled from 'styled-components';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example = args => (
  <Container>
    <TimeseriesSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
