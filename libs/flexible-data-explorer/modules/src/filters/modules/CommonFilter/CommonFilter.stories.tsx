import { ComponentStory } from '@storybook/react';

import { CommonFilter } from './CommonFilter';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Modules/CommonFilter',
  component: CommonFilter,
};

export const Example: ComponentStory<typeof CommonFilter> = (args) => (
  <CommonFilter {...args} />
);
Example.args = {
  dataType: 'Movie',
  field: {
    name: 'Name',
    type: 'string',
  },
};
