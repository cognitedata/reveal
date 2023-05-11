import { ComponentStory } from '@storybook/react';

import { DateTimeRangeInput } from './DateTimeRangeInput';

export default {
  title: 'Components/FlexibleFilter/Components/DateTimeRangeInput',
  component: DateTimeRangeInput,
};

export const Example: ComponentStory<typeof DateTimeRangeInput> = (args) => (
  <DateTimeRangeInput {...args} />
);
