import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { OptionType } from '@cognite/cogs.js';

import { LabelFilter } from './LabelFilter';

export default {
  title: 'Filters/LabelFilter',
  component: LabelFilter,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};

export const Example: ComponentStory<typeof LabelFilter> = (args) => {
  const [value, setValue] = useState<OptionType<string>[] | undefined>(
    undefined
  );
  return <LabelFilter {...args} value={value} onChange={setValue} />;
};

Example.args = {};
