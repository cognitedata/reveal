/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  Reveal3DResources,
  Reveal3DResourcesProps,
  RevealCanvas,
  RevealContext,
  useReveal
} from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { PropsWithChildren } from 'react';
import { ResourceUpdater } from '../src/components/Reveal3DResources/ResourceUpdater';

const meta = {
  title: 'Example/PrimitiveWrappers/PointCloudContainer',
  component: Reveal3DResources,
  argTypes: {
    resources: [
      {
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
      }
    ]
  },
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 2190489364871156,
        revisionId: 691965690290512,
        styling: {},
        transform: new Matrix4()
      }
    ]
  },
  render: ({ resources }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <PointCloudResource resources={resources} />
    </RevealContext>
  )
};

const PointCloudResource = ({ resources }: Reveal3DResourcesProps) => {
  const viewer = useReveal();
  return (
    <RevealCanvas>
      <Reveal3DResources
        resources={resources}
        onResourcesAdded={() => {
          viewer.fitCameraToModels();
        }}
      />
    </RevealCanvas>
  );
};
