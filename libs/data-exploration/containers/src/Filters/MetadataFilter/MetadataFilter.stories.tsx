import { ComponentStory } from '@storybook/react';

import { MetadataFilter } from './MetadataFilter';

export default {
  title: 'Filters/MetadataFilter',
  component: MetadataFilter,
};

export const Example: ComponentStory<typeof MetadataFilter> = () => {
  return <MetadataFilter />;
};
