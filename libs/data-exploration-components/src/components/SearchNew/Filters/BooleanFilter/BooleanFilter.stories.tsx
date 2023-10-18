import React, { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { BooleanFilter } from './BooleanFilter';

export default {
  title: 'Search Results New/Filters/BooleanFilter',
  component: BooleanFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof BooleanFilter> = (args) => {
  const [value, setValue] = useState<boolean | undefined>(false);
  return <BooleanFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};