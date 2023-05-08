import { ComponentStory } from '@storybook/react';
import { ResourceSelector } from './ResourceSelector';
export default {
  title: 'Component/ResourceSelector',
  component: ResourceSelector,
};

export const Example: ComponentStory<typeof ResourceSelector> = () => {
  return <ResourceSelector />;
};
