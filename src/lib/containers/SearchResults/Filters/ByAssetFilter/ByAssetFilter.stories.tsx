import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { ByAssetFilter } from './ByAssetFilter';

export default {
  title: 'Search Results/Filters/General/ByAssetFilter',
  component: ByAssetFilter,
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
