import React from 'react';
import { DataExplorationProvider } from 'context';
import { assets } from 'stubs/assets';
import { action } from '@storybook/addon-actions';
import { AssetBreadcrumb } from './AssetBreadcrumb';

export default {
  title: 'Assets/Base/AssetBreadcrumb',
  component: AssetBreadcrumb,
  decorators: [
    (storyFn: any) => (
      <DataExplorationProvider sdk={sdkMock}>
        {storyFn()}
      </DataExplorationProvider>
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
