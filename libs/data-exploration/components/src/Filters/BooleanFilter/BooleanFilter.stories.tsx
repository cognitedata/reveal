import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { BooleanFilter } from './BooleanFilter';

export default {
  title: 'Components/Filters/BooleanFilter',
  component: BooleanFilter,
  argTypes: {
    label: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof BooleanFilter> = (args) => {
  const [value, setValue] = useState<boolean | undefined>(false);
  return <BooleanFilter {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
