import { ComponentStory } from '@storybook/react';

import { SubTypeFilter } from './SubTypeFilter';

export default {
  title: 'Filters/SubTypeFilter',
  component: SubTypeFilter,
};

export const Example: ComponentStory<typeof SubTypeFilter> = () => {
  return <SubTypeFilter options={[]} />;
};
