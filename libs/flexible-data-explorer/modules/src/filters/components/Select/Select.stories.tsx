import { ComponentStory } from '@storybook/react';

import { Select } from './Select';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Components/Select',
  component: Select,
};

export const Example: ComponentStory<typeof Select> = (args) => (
  <Select {...args} />
);
Example.args = {
  options: [
    'Starts with',
    'Does not start with',
    'Contains',
    'Does not contain',
    'Is set',
    'Is not set',
  ],
};
