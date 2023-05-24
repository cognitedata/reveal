import { ComponentStory } from '@storybook/react';

import { Filter } from './Filter';

export default {
  title: 'FlexibleDataExplorer/Containers/Search/Filter',
  component: Filter,
};

export const Example: ComponentStory<typeof Filter> = (args) => (
  <Filter {...args} />
);
