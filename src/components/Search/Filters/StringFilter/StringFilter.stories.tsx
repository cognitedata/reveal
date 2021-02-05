import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { StringFilter } from './StringFilter';

export default {
  title: 'Search Results/Filters/StringFilter',
  component: StringFilter,
};
export const Example = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <StringFilter
      title={text('title', 'Title')}
      value={value}
      setValue={setValue}
    />
  );
};
