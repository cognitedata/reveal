import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { NumberFilter } from './NumberFilter';

export default {
  title: 'Components/Filters/NumberFilter',
  component: NumberFilter,
  argTypes: {
    label: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof NumberFilter> = (args) => {
  const [value, setValue] = useState<number | undefined>();
  return <NumberFilter {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
