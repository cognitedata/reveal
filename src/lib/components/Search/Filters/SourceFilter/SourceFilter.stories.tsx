import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { assets } from 'stubs/assets';
import { SourceFilter } from './SourceFilter';

export default {
  title: 'Search Results/Filters/General/SourceFilter',
  component: SourceFilter,
};

export const Example = () => (
  <SourceFilter
    items={assets}
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);
