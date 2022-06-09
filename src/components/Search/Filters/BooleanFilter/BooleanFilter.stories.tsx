import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { BooleanFilter } from './BooleanFilter';

export default {
  title: 'Search Results/Filters/BooleanFilter',
  component: BooleanFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof BooleanFilter> = args => {
  const [value, setValue] = useState<boolean | undefined>(false);
  return <BooleanFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
