import React from 'react';

import { ComponentStory } from '@storybook/react';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from '../types';

import { MultiSelectFilter } from './MultiSelectFilter';

export default {
  title: 'Filters/MultiSelectFilter',
  component: MultiSelectFilter,
};

export const Basic: ComponentStory<typeof MultiSelectFilter> = () => {
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

export const WithCount: ComponentStory<typeof MultiSelectFilter> = () => {
  const [value, setValue] = React.useState<MultiSelectOptionType<string>[]>();

  const options: Array<MultiSelectOptionType<string>> = [
    {
      label: 'product_type',
      value: 'product_type',
      count: 465,
    },
    {
      label: 'asset_external_id',
      value: 'asset_external_id',
      count: 15265,
    },
    {
      label: 'prefix',
      value: 'prefix',
      count: 60,
    },
    {
      label: 'isTextOnly',
      value: 'isTextOnly',
      count: 3255,
    },
  ];

  return (
    <MultiSelectFilter options={options} value={value} onChange={setValue} />
  );
};
