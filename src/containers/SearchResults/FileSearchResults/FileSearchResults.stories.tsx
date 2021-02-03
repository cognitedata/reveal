import React from 'react';
import { text } from '@storybook/addon-knobs';
import styled from 'styled-components';
import { FileSearchResults } from './FileSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => <FileSearchResults query={text('query', '')} />;

const Container = styled.div`
  height: 400px;
`;
