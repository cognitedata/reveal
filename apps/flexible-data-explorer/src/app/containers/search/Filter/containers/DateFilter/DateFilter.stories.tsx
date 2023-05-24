import { ComponentStory } from '@storybook/react';

import { DateFilter } from './DateFilter';

export default {
  title: 'FlexibleDataExplorer/Containers/Search/Filter/Containers/DateFilter',
  component: DateFilter,
};

export const Example: ComponentStory<typeof DateFilter> = (args) => (
  <DateFilter {...args} />
);
Example.args = {
  name: 'Filter name',
};
