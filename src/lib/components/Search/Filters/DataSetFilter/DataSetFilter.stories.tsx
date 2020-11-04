import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { DataSetFilter } from './DataSetFilter';

export default {
  title: 'Search Results/Filters/General/DataSetFilter',
  component: DataSetFilter,
};
export const Example = () => (
  <DataSetFilter
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);
