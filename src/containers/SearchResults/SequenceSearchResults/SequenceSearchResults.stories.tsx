import React from 'react';
import styled from 'styled-components';
import { SequenceSearchResults } from './SequenceSearchResults';

export default {
  title: 'Search Results/SequenceSearchResults',
  component: SequenceSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example = args => (
  <Container>
    <SequenceSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
