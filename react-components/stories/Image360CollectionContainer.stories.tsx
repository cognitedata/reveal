/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, RevealContainer } from '../src';
import { Color } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const meta = {
  title: 'Example/PrimitiveWrappers/Image360CollectionContainer',
  component: Image360CollectionContainer,
  tags: ['autodocs']
} satisfies Meta<typeof Image360CollectionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    collectionId: { siteId: 'Hibernia_RS2' }
  },
  render: ({ collectionId }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <Image360CollectionContainer collectionId={collectionId} />
    </RevealContainer>
  )
};
