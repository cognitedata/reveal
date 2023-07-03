/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, RevealContainer } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';

const meta = {
  title: 'Example/PrimitiveWrappers/Image360CollectionContainer',
  component: Image360CollectionContainer,
  tags: ['autodocs']
} satisfies Meta<typeof Image360CollectionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

export const Main: Story = {
  args: {
    siteId: 'Hibernia_RS2'
  },
  render: ({ siteId }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <Image360CollectionContainer siteId={siteId} />
    </RevealContainer>
  )
};
