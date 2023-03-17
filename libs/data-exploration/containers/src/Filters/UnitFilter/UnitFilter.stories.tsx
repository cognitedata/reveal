import { ComponentStory } from '@storybook/react';

import { UnitFilter } from './UnitFilter';

export default {
  title: 'Filters/UnitFilter',
  component: UnitFilter,
};

export const Example: ComponentStory<typeof UnitFilter> = () => {
  return <UnitFilter options={[]} />;
};
