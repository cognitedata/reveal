import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter';

export default {
  title: 'Search Results/Filters/General/ExternalIDPrefixFilter',
  component: ExternalIDPrefixFilter,
};
export const Example = () => (
  <ExternalIDPrefixFilter
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);
