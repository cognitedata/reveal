import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { DateFilterV2 } from './DateFilter';

export default {
  title: 'Search Results/Filters/DateFilterV2',
  component: DateFilterV2,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof DateFilterV2> = args => {
  const [value, setValue] = useState<
    { min?: number; max?: number } | undefined | null
  >();
  return <DateFilterV2 {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
