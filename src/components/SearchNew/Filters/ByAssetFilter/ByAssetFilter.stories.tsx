import React, { useState } from 'react';
import { ComponentStory } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { assets } from 'stubs/assets';
import { ByAssetFilter } from './ByAssetFilter';

export default {
  title: 'Search Results/Filters/ByAssetFilter',
  component: ByAssetFilter,
  argTypes: {
    title: {
      type: 'string',
    },
  },
};
export const Example: ComponentStory<typeof ByAssetFilter> = args => {
  const [value, setValue] = useState<number[] | undefined>(undefined);
  return <ByAssetFilter {...args} value={value} setValue={setValue} />;
};

Example.args = {
  title: 'Asset',
};

Example.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = canvasElement.querySelector('.cogs-select__control');
  await expect(select).toBeInTheDocument();

  await userEvent.click(select!);
  const option = canvas.getByText(assets[0].name!, {
    exact: false,
    selector: '.cogs-select__option > span',
  });
  await expect(option!).not.toBeNull();
  await expect(option!).toBeVisible();

  await userEvent.click(option!);
  await waitFor(() => {
    const selection = canvas.getByText(assets[0].name!, {
      selector: '.cogs-select__multi-value__label',
    });
    expect(selection).not.toBeNull();
    expect(selection).toBeVisible();
  });
};
