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

export const Example = args => {
  const [value, setValue] = useState<{ externalId: string }[] | undefined>(
    undefined
  );
  return <LabelFilter value={value} setValue={setValue} {...args} />;
};
Example.args = {
  resourceType: 'asset',
};
