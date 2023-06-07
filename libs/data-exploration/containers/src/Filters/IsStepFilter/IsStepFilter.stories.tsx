import { ComponentStory } from '@storybook/react';

import { IsStepFilter } from './IsStepFilter';

export default {
  title: 'Filters/IsStepFilter',
  component: IsStepFilter,
};

export const Example: ComponentStory<typeof IsStepFilter> = () => {
  return <IsStepFilter />;
};
