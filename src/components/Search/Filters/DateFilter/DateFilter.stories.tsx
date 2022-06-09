import { ComponentStory } from '@storybook/react';
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
export const Example: ComponentStory<typeof DateFilter> = args => {
  const [value, setValue] = useState<
    { min?: number; max?: number } | undefined | null
  >();
  return <DateFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
