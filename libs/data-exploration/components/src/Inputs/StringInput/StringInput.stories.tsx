import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { StringInput } from './StringInput';

export default {
  title: 'Components/Filters/StringFilter',
  component: StringInput,
  argTypes: {
    title: {
      label: 'string',
    },
  },
};
export const Example: ComponentStory<typeof StringInput> = (args) => {
  const [value, setValue] = useState<string | undefined>();
  return <StringInput {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
