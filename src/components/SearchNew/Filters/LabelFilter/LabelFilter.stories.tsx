import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { LabelFilter } from './LabelFilter';

export default {
  title: 'Search Results/Filters/LabelFilter',
  component: LabelFilter,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};

export const Example: ComponentStory<typeof LabelFilter> = args => {
  const [value, setValue] = useState<{ externalId: string }[] | undefined>(
    undefined
  );
  return <LabelFilter {...args} value={value} setValue={setValue} />;
};
Example.args = {
  resourceType: 'asset',
};
