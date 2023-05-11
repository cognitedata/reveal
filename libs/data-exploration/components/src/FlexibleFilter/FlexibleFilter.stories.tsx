import { ComponentStory } from '@storybook/react';

import { FlexibleFilter } from './FlexibleFilter';

export default {
  title: 'Components/FlexibleFilter',
  component: FlexibleFilter,
};

export const Example: ComponentStory<typeof FlexibleFilter> = (args) => (
  <FlexibleFilter {...args} />
);
