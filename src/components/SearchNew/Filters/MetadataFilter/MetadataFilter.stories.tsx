import { ComponentStory } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import React, { useState } from 'react';
import { assets } from 'stubs/assets';
import { MetadataFilterV2 } from './MetadataFilter';

export default {
  title: 'Search Results/Filters/MetadataFilterV2',
  component: MetadataFilterV2,
};

export const Example: ComponentStory<typeof MetadataFilterV2> = () => {
  const [value, setValue] = useState<any | undefined>(undefined);
  return <MetadataFilterV2 items={assets} value={value} setValue={setValue} />;
};

Example.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const checkIfExistsAndVisible = (el: HTMLElement) => {
    expect(el).not.toBeNull();
    expect(el).toBeVisible();
  };

  const keySelect = canvasElement.querySelector('.key-select > div');
  expect(keySelect).toBeInTheDocument();
  const valueSelect = canvasElement.querySelector('.value-select > div');
  expect(valueSelect).toBeInTheDocument();

  const assetWithMetadata = assets.find(asset => asset.metadata);
  const metadataKey = Object.keys(assetWithMetadata?.metadata || {})[0];
  const metadataValue = assetWithMetadata?.metadata?.[metadataKey];

  userEvent.click(keySelect!);
  const keyOption = canvas.getByText(metadataKey, {
    ignore: '[id^="aria-"]',
  });
  await waitFor(() => {
    checkIfExistsAndVisible(keyOption);
  });
  await userEvent.click(keyOption!);

  userEvent.click(valueSelect!);
  const valueOption = canvas.getByText(metadataValue!, {
    ignore: '[id^="aria-"]',
  });
  await waitFor(() => {
    checkIfExistsAndVisible(valueOption);
  });
  userEvent.click(valueOption!);
};
