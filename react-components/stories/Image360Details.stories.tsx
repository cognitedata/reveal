import type { Meta, StoryObj } from '@storybook/react';
import { Image360CollectionContainer, Image360Details, RevealCanvas } from '../src';
import { Color } from 'three';
import { useState } from 'react';
import { RevealStoryContext } from './utilities/RevealStoryContainer';

const meta = {
  title: 'Example/Image360Details',
  component: Image360Details,
  tags: ['autodocs']
} satisfies Meta<typeof Image360Details>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <RevealStoryContext color={new Color(0x4a4a4a)}>
        <RevealCanvas>
          <Image360CollectionContainer
            addImage360CollectionOptions={{ source: 'events', siteId: 'c_RC_2' }}
            onLoad={() => {
              setLoading(false);
            }}
          />
          {!loading && <Image360Details />}
        </RevealCanvas>
      </RevealStoryContext>
    );
  }
};
