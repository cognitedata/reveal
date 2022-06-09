import React, { useState } from 'react';
import { IdEither } from '@cognite/sdk';
import { ComponentStory } from '@storybook/react';
import { DataSetFilter } from './DataSetFilter';

export default {
  title: 'Search Results/Filters/DataSetFilter',
  component: DataSetFilter,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};
export const Example: ComponentStory<typeof DataSetFilter> = args => {
  const [value, setValue] = useState<IdEither[] | undefined>(undefined);
  return <DataSetFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  resourceType: 'asset',
};
