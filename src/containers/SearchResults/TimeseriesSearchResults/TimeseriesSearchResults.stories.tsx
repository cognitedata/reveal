import React from 'react';
import styled from 'styled-components';
import { text } from '@storybook/addon-knobs';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <TimeseriesSearchResults query={text('query', '')} />
);

const Container = styled.div`
  height: 400px;
`;
