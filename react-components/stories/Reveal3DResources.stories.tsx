/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer } from '../src';
import { Color } from 'three';
import { CameraController } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const meta = {
  title: 'Example/Reveal3DResources',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 2231774635735416,
        revisionId: 912809199849811,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        viewerOptions={{
          loadingIndicatorStyle: {
            opacity: 1,
            placement: 'topRight'
          }
        }}>
        <ReactQueryDevtools />
        <Reveal3DResources
          resources={resources}
          instanceStyling={[
            {
              fdmAssetExternalIds: [
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-2232218418169407' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-5658577936769408' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-850382017588429' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-3070761313703702' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-3951638513367021' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-7062796113231733' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-2890847372912846' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-329414570333157' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-3629108135100276' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-6317623811412748' },
                { space: 'pdms-mapping', externalId: 'EQ-l-2231774635735416-3132072649556228' }
              ],
              style: { cad: { color: new Color('#ff0000') } }
            }
          ]}
        />
        <CameraController
          initialFitCamera={{
            to: 'allModels'
          }}
          cameraControlsOptions={{
            changeCameraTargetOnClick: true,
            mouseWheelAction: 'zoomToCursor'
          }}
        />
      </RevealContainer>
    );
  }
};
