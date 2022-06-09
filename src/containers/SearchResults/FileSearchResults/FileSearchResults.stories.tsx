import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { FileSearchResults } from './FileSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof FileSearchResults> = args => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
