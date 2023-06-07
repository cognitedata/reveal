import { ComponentStory } from '@storybook/react';

import { AssetSelectFilter } from './AssetSelectFilter';

export default {
  title: 'Filters/AssetSelectFilter',
  component: AssetSelectFilter,
};

export const Example: ComponentStory<typeof AssetSelectFilter> = () => {
  return <AssetSelectFilter options={[]} />;
};
