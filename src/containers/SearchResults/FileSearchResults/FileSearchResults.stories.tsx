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
const Container = styled.div`
  height: 400px;
`;
