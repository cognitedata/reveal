import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { asset } from 'docs/stub';
import { files } from 'stubs/files';
import { timeseries } from 'stubs/timeseries';
import { AssetSmallPreview } from './AssetSmallPreview';

export default {
  title: 'Assets/AssetSmallPreview',
  component: AssetSmallPreview,
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
    if (query.includes('files')) {
      return { data: { items: files } };
    }
    if (query.includes('timeseries')) {
      return { data: { items: timeseries } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => <AssetSmallPreview assetId={1} />;

const Container = styled.div`
  padding: 20px;
  width: 300px;
  display: flex;
`;
