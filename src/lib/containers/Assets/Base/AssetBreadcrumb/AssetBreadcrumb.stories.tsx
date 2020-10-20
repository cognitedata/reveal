import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { assets } from 'stubs/assets';
import { action } from '@storybook/addon-actions';
import { AssetBreadcrumb } from './AssetBreadcrumb';

export default {
  title: 'Assets/Base/AssetBreadcrumb',
  component: AssetBreadcrumb,
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
  post: async (_: string, body: any) => {
    if (body.data.items[0].id === assets[0].id) {
      return { data: { items: [{ ...assets[0], parentId: assets[1].id }] } };
    }
    return { data: { items: assets.slice(1) } };
  },
};
export const Example = () => (
  <AssetBreadcrumb
    assetId={assets[0].id}
    onBreadcrumbClick={action('onBreadcrumbClick')}
  />
);

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
