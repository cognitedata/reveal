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
  argTypes: {
    styling: {
      options: ['FullRed', 'FullGreen', 'None', 'BlueAnnotations'],
      label: 'Styling of the first model',
      mapping: {
        FullRed: {
          defaultStyle: { color: new Color('red') }
        },
        FullGreen: {
          defaultStyle: { color: new Color('green') }
        },
        BlueAnnotations: {
          groups: [
            {
              annotationIds: [7526447911236241, 4768908317649926, 560990282344486],
              style: { color: new Color('blue') }
            }
          ]
        },
        None: {}
      }
    }
  },
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
    styling: {},
    transform: new Matrix4()
  },
  render: ({ addModelOptions, transform, styling }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <PointCloudContainer
        addModelOptions={addModelOptions}
        transform={transform}
        styling={styling}
      />
    </RevealContainer>
  )
};
