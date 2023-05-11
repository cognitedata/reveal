import { ComponentStory } from '@storybook/react';

import { DateTimeInput } from './DateTimeInput';

export default {
  title: 'Components/FlexibleFilter/Components/DateTimeInput',
  component: DateTimeInput,
};

export const Example: ComponentStory<typeof DateTimeInput> = (args) => (
  <DateTimeInput {...args} />
);
