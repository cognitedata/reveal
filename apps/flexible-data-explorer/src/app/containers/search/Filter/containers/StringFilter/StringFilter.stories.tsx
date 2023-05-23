import { ComponentStory } from '@storybook/react';

import { StringFilter } from './StringFilter';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Containers/StringFilter',
  component: StringFilter,
};

export const Example: ComponentStory<typeof StringFilter> = (args) => (
  <StringFilter {...args} />
);
Example.args = {
  name: 'Filter name',
};
