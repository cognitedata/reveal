import React, { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { DataSetFilter } from '../../../Search';
import { OptionValue } from '../types';

import { DataSetFilterV2 } from './DataSetFilter';

export default {
  title: 'Search Results/Filters/DataSetFilterV2',
  component: DataSetFilterV2,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};

export const Example: ComponentStory<typeof DataSetFilter> = (args) => {
  const [value, _setValue] = useState<OptionValue<number>[] | undefined>(
    undefined
  );
  return <DataSetFilterV2 {...args} value={value} setValue={() => null} />;
};

Example.args = {
  resourceType: 'asset',
};

// Example.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement);
//   const select = canvasElement.querySelector('.cogs-select__control');
//   await expect(select).toBeInTheDocument();

//   await userEvent.click(select!);
//   const option = canvas.getByText(datasets[0].name!, {
//     exact: false,
//     selector: '.cogs-select__option > span',
//   });
//   await expect(option!).not.toBeNull();
//   await expect(option!).toBeVisible();

//   await userEvent.click(option!);
//   await waitFor(() => {
//     const selection = canvas.getByText(datasets[0].name!, {
//       selector: '.cogs-select__multi-value__label',
//     });
//     expect(selection).not.toBeNull();
//     expect(selection).toBeVisible();
//   });
// };
