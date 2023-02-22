import { ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { StringFilter } from './StringFilter';

export default {
  title: 'Components/Filters/StringFilter',
  component: StringFilter,
  argTypes: {
    title: {
      label: 'string',
    },
  },
};
export const Example: ComponentStory<typeof StringFilter> = (args) => {
  const [value, setValue] = useState<string | undefined>();
  return <StringFilter {...args} value={value} onChange={setValue} />;
};
Example.args = {
  label: 'Title',
};
