/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer } from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { CameraController, ViewerAnchor } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
        modelId: 2551525377383868,
        revisionId: 2143672450453400,
        transform: new Matrix4().makeTranslation(-340, -480, 80)
      }
    ],
    styling: {},
    fdmAssetMappingConfig: {
      source: {
        space: 'hf_3d_schema',
        version: '1',
        type: 'view',
        externalId: 'cdf_3d_connection_data'
      },
      assetFdmSpace: 'hf_customer_a'
    }
  },
  render: ({ resources, styling, fdmAssetMappingConfig }) => {
    const position = new Vector3(50, 30, 50);
    const position2 = new Vector3(0, 0, 0);

    return (
      <RevealContainer
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        uiElements={<ReactQueryDevtools initialIsOpen={false} />}
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
        <ViewerAnchor position={position} uniqueKey="key2">
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
        <ViewerAnchor position={position2} uniqueKey="key1">
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
