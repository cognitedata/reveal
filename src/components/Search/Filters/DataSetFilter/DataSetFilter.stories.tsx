import React, { useState } from 'react';
import { IdEither } from '@cognite/sdk';
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
export const Example = args => {
  const [value, setValue] = useState<IdEither[] | undefined>(undefined);
  return <DataSetFilter value={value} setValue={setValue} {...args} />;
};
Example.args = {
  resourceType: 'asset',
};
