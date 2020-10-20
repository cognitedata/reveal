import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { assets } from 'stubs/assets';
import { files } from 'stubs/files';
import { timeseries } from 'stubs/timeseries';
import { sequences } from 'stubs/sequences';
import { events } from 'stubs/events';
import { SearchResultTable } from './SearchResultTable';

export default {
  title: 'Search Results/SearchResultTable',
  component: SearchResultTable,
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
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('assets')) {
      return { data: { items: assets } };
    }
    if (query.includes('files')) {
      return { data: { items: files } };
    }
    if (query.includes('timeseries')) {
      return { data: { items: timeseries } };
    }
    if (query.includes('sequences')) {
      return { data: { items: sequences } };
    }
    if (query.includes('events')) {
      return { data: { items: events } };
    }
    return { data: { items: [] } };
  },
  datasets: {
    list: async () => ({ data: { items: [] } }),
  },
  groups: {
    list: async () => ({ items: [] }),
  },
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/300/300' }],
  },
};
export const Example = () => (
  <SearchResultTable
    api={text('api', 'assets')}
    query={text('query', '')}
    onRowClick={action('onRowClick')}
    filter={{}}
  />
);

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
