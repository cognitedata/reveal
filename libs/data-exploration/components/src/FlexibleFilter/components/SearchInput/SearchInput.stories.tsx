import { ComponentStory } from '@storybook/react';

import { SearchInput } from './SearchInput';

export default {
  title: 'Components/FlexibleFilter/Components/SearchInput',
  component: SearchInput,
};

export const Example: ComponentStory<typeof SearchInput> = (args) => (
  <SearchInput {...args} />
);
