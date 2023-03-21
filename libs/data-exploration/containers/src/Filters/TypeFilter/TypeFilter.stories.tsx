import { ComponentStory } from '@storybook/react';

import { TypeFilter } from './TypeFilter';

export default {
  title: 'Filters/TypeFilter',
  component: TypeFilter,
};

export const Example: ComponentStory<typeof TypeFilter> = () => {
  return <TypeFilter options={[]} />;
};
