import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { BooleanFilter } from './BooleanFilter';

export default {
  title: 'Search Results/Filters/BooleanFilter',
  component: BooleanFilter,
};
export const Example = () => {
  const [value, setValue] = useState<boolean | undefined>(false);
  return (
    <BooleanFilter
      title={text('title', 'Title')}
      value={value}
      setValue={setValue}
    />
  );
};
