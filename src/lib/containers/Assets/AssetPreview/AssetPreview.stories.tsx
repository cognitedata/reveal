import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { asset } from 'docs/stub';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { AssetPreview, AssetPreviewTabType } from './AssetPreview';

export default {
  title: 'Assets/AssetPreview',
  component: AssetPreview,
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
      return { data: { items: [asset] } };
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
  <AssetPreview
    assetId={1}
    onTabChange={action('onTabChange')}
    tab={select<AssetPreviewTabType>(
      'tab',
      ['details', 'timeseries', 'files', 'sequences', 'events', 'children'],
      'details'
    )}
  />
);

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
