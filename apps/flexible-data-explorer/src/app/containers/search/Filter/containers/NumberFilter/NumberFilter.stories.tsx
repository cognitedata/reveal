import { ComponentStory } from '@storybook/react';

import { NumberFilter } from './NumberFilter';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Containers/NumberFilter',
  component: NumberFilter,
};

export const Example: ComponentStory<typeof NumberFilter> = (args) => (
  <NumberFilter {...args} />
);
Example.args = {
  name: 'Filter name',
};
