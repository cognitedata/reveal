import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { text } from '@storybook/addon-knobs';
import { assets } from 'stubs/assets';
import { AssetSearchResults } from './AssetSearchResults';

export default {
  title: 'Search Results/AssetSearchResults',
  component: AssetSearchResults,
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
    if (query.includes('assets/byids')) {
      return {
        data: { items: assets.filter(el => body.data.items[0].id === el.id) },
      };
    }
    if (query.includes('assets')) {
      return { data: { items: assets } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => <AssetSearchResults query={text('query', '')} />;

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
