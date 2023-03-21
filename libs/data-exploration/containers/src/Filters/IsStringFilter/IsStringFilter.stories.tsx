import { ComponentStory } from '@storybook/react';

import { IsStringFilter } from './IsStringFilter';

export default {
  title: 'Filters/IsStringFilter',
  component: IsStringFilter,
};

export const Example: ComponentStory<typeof IsStringFilter> = () => {
  return <IsStringFilter />;
};
