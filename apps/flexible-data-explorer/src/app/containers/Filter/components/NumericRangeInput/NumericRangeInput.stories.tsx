import { ComponentStory } from '@storybook/react';

import { NumericRangeInput } from './NumericRangeInput';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Components/NumericRangeInput',
  component: NumericRangeInput,
};

export const Example: ComponentStory<typeof NumericRangeInput> = (args) => (
  <NumericRangeInput {...args} />
);
