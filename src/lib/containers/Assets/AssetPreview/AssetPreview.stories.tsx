import React from 'react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { AssetPreview, AssetPreviewTabType } from './AssetPreview';

export default {
  title: 'Assets/AssetPreview',
  component: AssetPreview,
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
