import { ComponentStory } from '@storybook/react';

import { Input } from './Input';

export default {
  title: 'FlexibleDataExplorer/Containers/Search/Filter/Components/Input',
  component: Input,
};

export const Example: ComponentStory<typeof Input> = (args) => (
  <Input {...args} />
);
