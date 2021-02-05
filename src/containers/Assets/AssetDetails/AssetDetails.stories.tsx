import React from 'react';
import { assets } from 'stubs/assets';
import { AssetDetails } from './AssetDetails';

export default {
  title: 'Assets/AssetDetails',
  component: AssetDetails,
};
export const Example = () => <AssetDetails asset={assets[0]} />;
