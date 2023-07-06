/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { PointCloudContainer, RevealContainer } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const meta = {
  title: 'Example/PrimitiveWrappers/PointCloudContainer',
  component: PointCloudContainer,
  tags: ['autodocs']
} satisfies Meta<typeof PointCloudContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 3865289545346058,
      revisionId: 4160448151596909
    },
    transform: new Matrix4()
  },
  render: ({ addModelOptions, transform }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <PointCloudContainer addModelOptions={addModelOptions} transform={transform} />
    </RevealContainer>
  )
};
