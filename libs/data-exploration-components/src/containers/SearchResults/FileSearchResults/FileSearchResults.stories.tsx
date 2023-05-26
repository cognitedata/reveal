import React from 'react';

import styled from 'styled-components';

import { ComponentStory } from '@storybook/react';

import { FileLinkedSearchResults } from './FileLinkedSearchResults';
import { FileSearchResults } from './FileSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  argTypes: {
    query: { control: 'text' },
    isGroupingFilesEnabled: { control: 'boolean' },
  },
};

export const Example: ComponentStory<typeof FileSearchResults> = (args) => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

Example.args = {
  showCount: true,
};

export const GroupingEnabled: ComponentStory<typeof FileSearchResults> = (
  args
) => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

GroupingEnabled.args = {
  isGroupingFilesEnabled: true,
  showCount: true,
};

export const LinkedSearchResults: ComponentStory<
  typeof FileLinkedSearchResults
> = (args) => (
  <Container>
    <FileLinkedSearchResults {...args} />
  </Container>
);

LinkedSearchResults.args = {
  isGroupingFilesEnabled: true,
};

const Container = styled.div`
  height: 400px;
`;
