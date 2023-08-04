import { ComponentStory } from '@storybook/react';

import { NumberInput } from './NumberInput';

export default {
  title: 'FlexibleDataExplorer/Containers/Search/Filter/Components/NumberInput',
  component: NumberInput,
};

export const Example: ComponentStory<typeof NumberInput> = (args) => (
  <NumberInput {...args} />
);
