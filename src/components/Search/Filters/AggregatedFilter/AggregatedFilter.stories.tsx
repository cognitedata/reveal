import React, { useState } from 'react';
import { assets } from '../../../../stubs/assets';
import { AggregatedFilter } from './AggregatedFilter';

export default {
  title: 'Search Results/Filters/AggregatedFilter',
  component: AggregatedFilter,
  argTypes: {
    title: {
      type: 'string',
    },
    aggregator: {
      type: 'string',
    },
  },
};

export const Example = args => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <AggregatedFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Source',
  aggregator: 'source',
  items: assets,
};
