import { ComponentStory } from '@storybook/react';

import { TextInput } from './TextInput';

export default {
  title: 'Components/FlexibleFilter/Components/TextInput',
  component: TextInput,
};

export const Example: ComponentStory<typeof TextInput> = (args) => (
  <TextInput {...args} />
);
