import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { StringFilterV2 } from './StringFilter';

export default {
  title: 'Search Results/Filters/StringFilterV2',
  component: StringFilterV2,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof StringFilterV2> = args => {
  const [value, setValue] = useState<string | undefined>();
  return <StringFilterV2 {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
