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
  title: 'Example/Reveal3DResources',
  component: Reveal3DResources,
  tags: ['autodocs'],
  argTypes: {
    styling: {
      description: 'Styling of all models',
      options: ['RedCad', 'GreenPointCloud', 'BlueCrane', 'GreenRedAssetMapped', 'None'],
      control: {
        type: 'radio'
      },
      label: 'Styling of models',
      mapping: {
        RedCad: {
          defaultStyle: {
            cad: { color: new Color('red') }
          }
        },
        GreenPointCloud: {
          defaultStyle: {
            pointcloud: { color: new Color('green') }
          }
        },
        BlueCrane: {
          groups: [
            {
              fdmAssetExternalIds: [
                '23de4d93f9f482f307272f4924b83bd9cdc71e33e06003c7ec0b540135e13c24' // Rotating crane
              ],
              style: {
                cad: {
                  color: new Color('blue')
                }
              }
            }
          ]
        },
        GreenRedAssetMapped: {
          defaultStyle: {
            cad: { color: new Color('white') }
          },
          groups: [
            {
              fdmAssetExternalIds: [
                '23de4d93f9f482f307272f4924b83bd9cdc71e33e06003c7ec0b540135e13c24', // Rotating crane
                'ca020a82b244eed433ca598a7410169fc21543d6192eebd74fba70a5af984db7' // 1 Pipe in the middle
              ],
              style: {
                cad: {
                  color: new Color('green')
                }
              }
            },
            {
              fdmAssetExternalIds: [
                '783fe42d9b24229e1873a49a0ce189fc27c0741f6739f82b29e765b835de17f2', // Big tank on the side
                'e39746a8d819f863a92ef37edc1b5d99e89d2e990c1a5951adfe9835f90de34c', // 2 Pipe in the middle
                '1db4e31c8f68acee9ff62a098a103cd49e5cea0320d7aed8aa345e99c6b2663d' // 3 Pipe in the middle
              ],
              style: {
                cad: {
                  color: new Color('red')
                }
              }
            }
          ]
        },
        None: {}
      }
    }
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
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 0, 0)
      },
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 10, 0)
      },
      {
        siteId: 'c_RC_2'
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      },
      {
        modelId: 2551525377383868,
        revisionId: 2143672450453400,
        transform: new Matrix4().makeTranslation(-340, -480, 80)
      }
    ],
    styling: {},
    fdmAssetMappingConfig: {
      source: {
        space: 'fdm-3d-test-savelii',
        version: '1',
        type: 'view',
        externalId: 'CDF_3D_Connection_Data'
      },
      assetFdmSpace: 'bark-corporation'
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
              borderColor: 'black',
              borderWidth: '10px',
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
              borderColor: 'black',
              borderWidth: '10px',
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
