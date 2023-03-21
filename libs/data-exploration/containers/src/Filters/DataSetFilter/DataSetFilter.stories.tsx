import { ComponentStory } from '@storybook/react';

import { DataSetFilter } from './DataSetFilter';

export default {
  title: 'Filters/DataSetFilter',
  component: DataSetFilter,
};

export const Example: ComponentStory<typeof DataSetFilter> = () => {
  return <DataSetFilter options={[]} />;
};
