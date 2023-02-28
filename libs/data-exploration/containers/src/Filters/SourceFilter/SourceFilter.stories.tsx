import { ComponentStory } from '@storybook/react';

import { SourceFilter } from './SourceFilter';

export default {
  title: 'Filters/SourceFilter',
  component: SourceFilter,
};

export const Example: ComponentStory<typeof SourceFilter> = () => {
  return <SourceFilter items={[]} />;
};
