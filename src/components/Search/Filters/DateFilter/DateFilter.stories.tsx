import React, { useState } from 'react';
import { DateFilter } from './DateFilter';

export default {
  title: 'Search Results/Filters/DateFilter',
  component: DateFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example = args => {
  const [value, setValue] = useState<
    { min?: number; max?: number } | undefined
  >();
  return <DateFilter value={value} setValue={setValue} {...args} />;
};
Example.args = {
  title: 'Title',
};
