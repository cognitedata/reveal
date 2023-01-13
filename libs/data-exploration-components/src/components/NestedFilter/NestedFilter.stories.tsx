import { ComponentStory } from '@storybook/react';

import { NestedFilter } from './NestedFilter';
import { OptionType } from './types';

export default {
  title: 'Search Results/Filters/NestedFilter',
  component: NestedFilter,
};

export const Example: ComponentStory<typeof NestedFilter> = () => {
  const options: Array<OptionType> = [
    {
      label: 'product_type',
      value: 'product_type',
      count: 405504,
      options: [
        {
          label: '15_9_9_A_product_type_1',
          value: '15_9_9_A_product_type_1',
          count: 1650000,
        },
        {
          label: '15_9_9_A_product_type_2',
          value: '15_9_9_A_product_type_2',
          count: 20504,
        },
        {
          label: '15_9_9_A_product_type_3',
          value: '15_9_9_A_product_type_3',
          count: 405504,
        },
        {
          label: '15_9_9_A_product_type_4',
          value: '15_9_9_A_product_type_4',
          count: 340504,
        },
        {
          label: '15_9_9_A_product_type_5',
          value: '15_9_9_A_product_type_5',
          count: 256504,
        },
      ],
    },
    {
      label: 'asset_external_id',
      value: 'asset_external_id',
      count: 45504,
    },
    {
      label: 'prefix',
      value: 'prefix',
      count: 20504,
    },
    {
      label: 'isTextOnly',
      value: 'isTextOnly',
      count: 1650000,
    },
  ];

  return (
    <NestedFilter
      width={270}
      options={options}
      onChange={console.log}
      onClickApply={console.log}
    />
  );
};
