import { ComponentStory } from '@storybook/react';

import { NumberInput } from './NumberInput';

export default {
  title: 'Components/FlexibleFilter/Components/NumberInput',
  component: NumberInput,
};

export const Example: ComponentStory<typeof NumberInput> = (args) => (
  <NumberInput {...args} />
);
