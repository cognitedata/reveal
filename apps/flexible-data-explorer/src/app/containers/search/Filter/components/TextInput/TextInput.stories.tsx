import { ComponentStory } from '@storybook/react';

import { TextInput } from './TextInput';

export default {
  title: 'FlexibleDataExplorer/Containers/Search/Filter/Components/TextInput',
  component: TextInput,
};

export const Example: ComponentStory<typeof TextInput> = (args) => (
  <TextInput {...args} />
);
