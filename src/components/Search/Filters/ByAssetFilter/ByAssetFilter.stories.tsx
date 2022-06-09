import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { ByAssetFilter } from './ByAssetFilter';

export default {
  title: 'Search Results/Filters/ByAssetFilter',
  component: ByAssetFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof ByAssetFilter> = args => {
  const [value, setValue] = useState<number[] | undefined>(undefined);
  return <ByAssetFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  title: 'Title',
};
