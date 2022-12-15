import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { StringFilter } from './StringFilter';

export default {
  title: 'Search Results/Filters/StringFilter',
  component: StringFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof StringFilter> = args => {
  const [value, setValue] = useState<string | undefined>();
  return <StringFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
