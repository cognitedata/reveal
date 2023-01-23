import { OptionType } from '@cognite/cogs.js';
import { ComponentStory } from '@storybook/react';

import { MultiSelectFilter } from './MultiSelectFilter';

export default {
  title: 'Search Results/Filters/MultiSelectFilter',
  component: MultiSelectFilter,
};

export const Example: ComponentStory<typeof MultiSelectFilter> = () => {
  const options: Array<OptionType<string>> = [
    {
      label: 'product_type',
      value: 'product_type',
    },
    {
      label: 'asset_external_id',
      value: 'asset_external_id',
    },
    {
      label: 'prefix',
      value: 'prefix',
    },
    {
      label: 'isTextOnly',
      value: 'isTextOnly',
    },
  ];

  return <MultiSelectFilter options={options} onChange={console.log} />;
};
