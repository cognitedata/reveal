import { ComponentStory } from '@storybook/react';

import { BooleanFilter } from './BooleanFilter';

export default {
  title: 'Components/FlexibleFilter/Containers/BooleanFilter',
  component: BooleanFilter,
};

export const Example: ComponentStory<typeof BooleanFilter> = (args) => (
  <BooleanFilter {...args} />
);
Example.args = {
  name: 'Filter name',
};
