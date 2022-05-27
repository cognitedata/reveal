import React from 'react';
import styled from 'styled-components';
import { FileSearchResults } from './FileSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example = args => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
