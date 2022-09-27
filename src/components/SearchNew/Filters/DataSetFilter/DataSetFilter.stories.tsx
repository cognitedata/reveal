import React, { useState } from 'react';
import { IdEither } from '@cognite/sdk';
import { ComponentStory } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { datasets } from 'stubs/datasets';
import { DataSetFilter } from './DataSetFilter';

export default {
  title: 'Search Results/Filters/DataSetFilter',
  component: DataSetFilter,
  argTypes: {
    resourceType: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    },
  },
};

export const Example: ComponentStory<typeof DataSetFilter> = args => {
  const [value, setValue] = useState<IdEither[] | undefined>(undefined);
  return <DataSetFilter {...args} value={value} setValue={setValue} />;
};

Example.args = {
  resourceType: 'asset',
};

Example.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = canvasElement.querySelector('.cogs-select__control');
  await expect(select).toBeInTheDocument();

  await userEvent.click(select!);
  const option = canvas.getByText(datasets[0].name!, {
    exact: false,
    selector: '.cogs-select__option > span',
  });
  await expect(option!).not.toBeNull();
  await expect(option!).toBeVisible();

  await userEvent.click(option!);
  await waitFor(() => {
    const selection = canvas.getByText(datasets[0].name!, {
      selector: '.cogs-select__multi-value__label',
    });
    expect(selection).not.toBeNull();
    expect(selection).toBeVisible();
  });
};
