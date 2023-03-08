import React, { useState } from 'react';
import { ComponentStory } from '@storybook/react';

import { assets } from '@data-exploration-components/stubs/assets';
import { AggregatedFilter } from './AggregatedFilter';

export default {
  title: 'Search Results/Filters/AggregatedFilter',
  component: AggregatedFilter,
  argTypes: {
    title: {
      type: 'string',
    },
    aggregator: {
      type: 'string',
    },
  },
};

export const Example: ComponentStory<typeof AggregatedFilter> = (args) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <AggregatedFilter {...args} value={value} setValue={setValue} />;
};

Example.args = {
  title: 'Source',
  aggregator: 'source',
  items: assets,
};

// FIXME: Write it in unit test instead!
// Example.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement);
//   const checkIfExistsAndVisible = (el: HTMLElement) => {
//     expect(el).not.toBeNull();
//     expect(el).toBeVisible();
//   };

//   const select = canvasElement.querySelector('.aggregated-filter-select > div');
//   await expect(select).toBeInTheDocument();

//   await userEvent.click(select!);
//   const option = canvas.getByText(assets[0].source!, {
//     ignore: '[id^="aria-"]',
//   });
//   await waitFor(() => {
//     checkIfExistsAndVisible(option);
//   });

//   await userEvent.click(option!);
//   const selection = canvas.getByText(assets[0].source!, {
//     selector: '[class*="-singleValue"]',
//   });
//   await waitFor(() => {
//     checkIfExistsAndVisible(selection);
//   });
// };
