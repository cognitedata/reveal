import React from 'react';
import { action } from '@storybook/addon-actions';
import AssetHierarchy from './AssetHierarchy';

export default {
  title: 'Assets/AssetHierarchy',
  component: AssetHierarchy,
};

export const Example = () => (
  <div style={{ height: '500px' }}>
    <AssetHierarchy onSelect={action('onSelect')} />
  </div>
);
