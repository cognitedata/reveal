import React from 'react';
import styled from 'styled-components';
import { text } from '@storybook/addon-knobs';
import { SequenceSearchResults } from './SequenceSearchResults';

export default {
  title: 'Search Results/SequenceSearchResults',
  component: SequenceSearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <SequenceSearchResults query={text('query', '')} />
);

const Container = styled.div`
  height: 400px;
`;
