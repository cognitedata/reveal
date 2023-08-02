/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer } from '../src';
import { Color, Vector3 } from 'three';
import { CameraController, ViewerAnchor } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const meta = {
  title: 'Example/ViewerAnchor',
  component: Reveal3DResources,
  tags: ['autodocs'],
  argTypes: {
    styling: {}
  }
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189
      }
    ]
  },
  render: ({ resources, styling, fdmAssetMappingConfig }) => {
    const position = new Vector3(50, 30, 50);
    const position2 = new Vector3();

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
        <Reveal3DResources
          resources={resources}
          styling={styling}
          fdmAssetMappingConfig={fdmAssetMappingConfig}
        />
        <ViewerAnchor position={position} >
          <p
            style={{
              backgroundColor: 'turquoise',
              padding: '10px',
              borderRadius: '10px',
              borderStyle: 'solid',
              maxWidth: '300px',
              transform: 'translate(-50%, calc(-100% - 50px))'
            }}>
            This label is stuck at position {position.toArray().join(',')}
          </p>
        </ViewerAnchor>
        <ViewerAnchor position={position2}>
          <p
            style={{
              backgroundColor: 'red',
              padding: '10px',
              borderRadius: '10px',
              borderStyle: 'solid',
              maxWidth: '300px',
              transform: 'translate(0px, 0px)'
            }}>
            This label is stuck at position {position2.toArray().join(',')}
          </p>
        </ViewerAnchor>
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
