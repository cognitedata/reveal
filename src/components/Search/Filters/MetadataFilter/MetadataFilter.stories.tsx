import { ComponentStory } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import React, { useState } from 'react';
import { assets } from 'stubs/assets';
import { MetadataFilter } from './MetadataFilter';

export default {
  title: 'Search Results/Filters/MetadataFilter',
  component: MetadataFilter,
};

export const Example: ComponentStory<typeof MetadataFilter> = () => {
  const [value, setValue] = useState<any | undefined>(undefined);
  return <MetadataFilter items={assets} value={value} setValue={setValue} />;
};

Example.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const checkIfExistsAndVisible = (el: HTMLElement) => {
    expect(el).not.toBeNull();
    expect(el).toBeVisible();
  };

  const keySelect = canvasElement.querySelector('.key-select > div');
  await expect(keySelect).toBeInTheDocument();
  const valueSelect = canvasElement.querySelector('.value-select > div');
  await expect(valueSelect).toBeInTheDocument();

  const assetWithMetadata = assets.find(asset => asset.metadata);
  const metadataKey = Object.keys(assetWithMetadata?.metadata || {})[0];
  const metadataValue = assetWithMetadata?.metadata?.[metadataKey];

  await userEvent.click(keySelect!);
  const keyOption = canvas.getByText(metadataKey, {
    ignore: '[id^="aria-"]',
  });
  await waitFor(() => {
    checkIfExistsAndVisible(keyOption);
  });
  await userEvent.click(keyOption!);

  await userEvent.click(valueSelect!);
  const valueOption = canvas.getByText(metadataValue!, {
    ignore: '[id^="aria-"]',
  });
  await waitFor(() => {
    checkIfExistsAndVisible(valueOption);
  });
  await userEvent.click(valueOption!);
  await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));

  const chip = canvas.getByText(`${metadataKey}: ${metadataValue}`);
  await waitFor(() => {
    checkIfExistsAndVisible(chip);
  });
};
