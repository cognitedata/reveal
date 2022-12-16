import React from 'react';
import { action } from '@storybook/addon-actions';
import { assets, rootAssets } from '@data-exploration-components/stubs/assets';
import { AssetBreadcrumb } from './AssetBreadcrumb';

const sdkMock = {
  post: async (_: string, body: any) => {
    if (body.data.items[0].id === assets[0].id) {
      return { data: { items: [assets[0]] } };
    }
    return { data: { items: [rootAssets[0], assets[0]] } };
  },
};

export default {
  title: 'Assets/Base/AssetBreadcrumb',
  component: AssetBreadcrumb,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};

export const Example = () => (
  <AssetBreadcrumb
    assetId={assets[0].id}
    onBreadcrumbClick={action('onBreadcrumbClick')}
  />
);
