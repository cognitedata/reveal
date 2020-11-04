import React from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { LabelFilter } from './LabelFilter';

export default {
  title: 'Search Results/Filters/General/LabelFilter',
  component: LabelFilter,
};

export const Example = () => (
  <LabelFilter
    resourceType={select<ResourceType>(
      'api',
      ['asset', 'timeSeries', 'sequence', 'file', 'event'],
      'asset'
    )}
  />
);
