import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { assets } from 'stubs/assets';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { ByAssetFilter } from './ByAssetFilter';

export default {
  title: 'Search Results/Filters/General/ByAssetFilter',
  component: ByAssetFilter,
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
  post: async () => ({ data: { items: assets } }),
};
export const Example = () => (
  <ByAssetFilter
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;
