import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { NumberFilter } from './NumberFilter';

export default {
  title: 'Search Results/Filters/NumberFilter',
  component: NumberFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof NumberFilter> = args => {
  const [value, setValue] = useState<number | undefined>();
  return <NumberFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
