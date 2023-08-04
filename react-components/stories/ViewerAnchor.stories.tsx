/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer, withSuppressRevealEvents } from '../src';
import { Color, Vector3 } from 'three';
import { CameraController, ViewerAnchor } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import styled from 'styled-components';
import { DefaultFdmConfig } from './utilities/fdmConfig';

const meta = {
  title: 'Example/ViewerAnchor',
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
        modelId: 1791160622840317,
        revisionId: 498427137020189
      }
    ],
    fdmAssetMappingConfig: DefaultFdmConfig
  },
  render: ({ resources, fdmAssetMappingConfig }) => {
    const position = new Vector3(25, 0, -25);
    const position2 = new Vector3();
    const SuppressedDiv = withSuppressRevealEvents(styled.div``);

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
        <Reveal3DResources resources={resources} fdmAssetMappingConfig={fdmAssetMappingConfig} />
        <ViewerAnchor position={position}>
          <div
            style={{
              backgroundColor: 'turquoise',
              padding: '10px',
              borderRadius: '10px',
              borderStyle: 'solid',
              maxWidth: '300px',
              transform: 'translate(-50%, calc(-100% - 50px))'
            }}>
            <SuppressedDiv>
              <p>This label is stuck at position {position.toArray().join(',')}</p>
            </SuppressedDiv>
          </div>
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
