import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { DateFilter } from './DateFilter';

export default {
  title: 'Search Results/Filters/DateFilter',
  component: DateFilter,
};
export const Example = () => {
  const [value, setValue] = useState<
    { min?: number; max?: number } | undefined
  >(undefined);
  return (
    <DateFilter
      title={text('title', 'Title')}
      value={value}
      setValue={setValue}
    />
  );
};
