import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { BooleanInput } from './BooleanInput';

export default {
  title: 'Components/Filters/BooleanFilter',
  component: BooleanInput,
  argTypes: {
    label: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof BooleanInput> = (args) => {
  const [value, setValue] = useState<boolean | undefined>(false);
  return <BooleanInput {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
