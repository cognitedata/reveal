import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { NumberInput } from './NumberInput';

export default {
  title: 'Components/Filters/NumberFilter',
  component: NumberInput,
  argTypes: {
    label: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof NumberInput> = (args) => {
  const [value, setValue] = useState<number | undefined>();
  return <NumberInput {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
