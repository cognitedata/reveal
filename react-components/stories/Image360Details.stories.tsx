/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, Image360Details, RevealCanvas, RevealContext } from '../src';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { Color } from 'three';
import { useState } from 'react';

const meta = {
  title: 'Example/Image360Details',
  component: Image360Details,
  tags: ['autodocs']
} satisfies Meta<typeof Image360Details>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
        <RevealCanvas>
          <Image360CollectionContainer
            addImage360CollectionOptions={{ siteId: 'c_RC_2' }}
            onLoad={() => {
              setLoading(false);
            }}
          />
          {!loading && <Image360Details />}
        </RevealCanvas>
      </RevealContext>
    );
  }
};
