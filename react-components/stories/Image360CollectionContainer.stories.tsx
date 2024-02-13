/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, RevealCanvas } from '../src';
import { Color } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealContext } from '../src/components/RevealContext/RevealContext';

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
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <RevealCanvas>
        <Image360CollectionContainer collectionId={collectionId} />
      </RevealCanvas>
    </RevealContext>
  )
};
