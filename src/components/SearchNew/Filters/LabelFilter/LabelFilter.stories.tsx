import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { LabelFilterV2 } from './LabelFilter';

export default {
  title: 'Search Results/Filters/LabelFilterV2',
  component: LabelFilterV2,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};

export const Example: ComponentStory<typeof LabelFilterV2> = args => {
  const [value, setValue] = useState<{ externalId: string }[] | undefined>(
    undefined
  );
  return <LabelFilterV2 {...args} value={value} setValue={setValue} />;
};
Example.args = {
  resourceType: 'asset',
};
