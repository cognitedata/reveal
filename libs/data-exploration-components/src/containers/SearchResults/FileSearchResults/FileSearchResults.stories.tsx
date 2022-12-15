import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { FileSearchResults } from './FileSearchResults';
import { FileLinkedSearchResults } from './FileLinkedSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  argTypes: {
    query: { control: 'text' },
    isGroupingFilesEnabled: { control: 'boolean' },
  },
};

export const Example: ComponentStory<typeof FileSearchResults> = args => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

Example.args = {
  showCount: true,
};

export const GroupingEnabled: ComponentStory<
  typeof FileSearchResults
> = args => (
  <Container>
    <FileSearchResults {...args} />
  </Container>
);

GroupingEnabled.args = {
  isGroupingFilesEnabled: true,
  parentResource: { externalId: 'dsd', id: 123, type: 'file' },
  relatedResourceType: 'linkedResource',
  showCount: true,
};

export const LinkedSearchResults: ComponentStory<
  typeof FileLinkedSearchResults
> = args => (
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
