import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { assets } from 'stubs/assets';
import { MetadataFilter } from './MetadataFilter';

export default {
  title: 'Search Results/Filters/General/MetadataFilter',
  component: MetadataFilter,
};

export const Example = () => (
  <MetadataFilter
    items={assets}
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);
