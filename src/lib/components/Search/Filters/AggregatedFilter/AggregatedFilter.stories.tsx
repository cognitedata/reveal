import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { assets } from 'lib/stubs/assets';
import { AggregatedFilter } from './AggregatedFilter';

export default {
  title: 'Search Results/Filters/AggregatedFilter',
  component: AggregatedFilter,
};

export const Example = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <AggregatedFilter
      title={text('title', 'Source')}
      items={assets}
      aggregator={text('aggregator', 'source')}
      value={value}
      setValue={setValue}
    />
  );
};
