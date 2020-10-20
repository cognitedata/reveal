import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { text } from '@storybook/addon-knobs';
import { timeseries } from 'stubs/timeseries';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  decorators: [
    (storyFn: any) => (
      <Container>
        <DataExplorationProvider sdk={sdkMock}>
          {storyFn()}
        </DataExplorationProvider>
      </Container>
    ),
  ],
};

const sdkMock = {
  post: async (query: string, body: any) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('timeseries/byids')) {
      return {
        data: {
          items: timeseries.filter(el => body.data.items[0].id === el.id),
        },
      };
    }
    if (query.includes('timeseries')) {
      return { data: { items: timeseries } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => (
  <TimeseriesSearchResults query={text('query', '')} />
);

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
