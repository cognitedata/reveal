import { ComponentStory } from '@storybook/react';

import { DateTimeRangeInput } from './DateTimeRangeInput';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Components/DateTimeRangeInput',
  component: DateTimeRangeInput,
};

export const Example: ComponentStory<typeof DateTimeRangeInput> = (args) => (
  <DateTimeRangeInput {...args} />
);
