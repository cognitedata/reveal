/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  type AddReveal3DModelOptions,
  Reveal3DResources,
  type Reveal3DResourcesProps,
  type Reveal3DResourcesStyling,
  RevealContainer
} from '../src';
import { Color, Matrix4 } from 'three';
import { CameraController } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { DefaultFdmConfig } from './utilities/fdmConfig';
import { type ReactElement, useMemo } from 'react';
import { useMappedEquipmentBy3DModelsList } from '../src/hooks/useMappedEquipmentBy3DModelsList';
import { is3DModelOptions } from './utilities/is3DModelOptions';

const meta = {
  title: 'Example/ModelsStyling',
  component: Reveal3DResources,
  tags: ['autodocs'],
  argTypes: {
    styling: {
      description: 'Styling of all models',
      options: ['RedCad', 'BlueMapped', 'GreenRedAssetMapped', 'None'],
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
        BlueMapped: {
          groups: [
            {
              fdmAssetExternalIds: ['allMappings'],
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
              fdmAssetExternalIds: ['halfMappings'],
              style: {
                cad: {
                  color: new Color('green')
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
        modelId: 2551525377383868,
        revisionId: 2143672450453400,
        transform: new Matrix4().makeTranslation(-340, -480, 80)
      }
    ],
    styling: {},
    fdmAssetMappingConfig: DefaultFdmConfig
  },
  render: ({ resources, styling, fdmAssetMappingConfig }) => {
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
        <StyledReveal3DResources
          resources={resources}
          styling={styling}
          fdmAssetMappingConfig={fdmAssetMappingConfig}
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

const StyledReveal3DResources = (props: Reveal3DResourcesProps): ReactElement => {
  const filtered = props.resources?.filter<AddReveal3DModelOptions>(
    (resource): resource is AddReveal3DModelOptions => is3DModelOptions(resource)
  );

  if (props.fdmAssetMappingConfig === undefined) {
    throw new Error('fdmAssetMappingConfig is undefined');
  }

  const { data } = useMappedEquipmentBy3DModelsList(filtered);

  const styling = useMemo(() => {
    const stylingMode = props?.styling?.groups?.[0].fdmAssetExternalIds[0];

    let newStyling: Reveal3DResourcesStyling = {};

    switch (stylingMode) {
      case 'allMappings':
        newStyling = {
          defaultStyle: {
            cad: {
              color: new Color('white')
            }
          },
          groups: [
            {
              style: {
                cad: {
                  color: new Color('blue')
                }
              },
              fdmAssetExternalIds: data ?? []
            }
          ]
        };
        break;
      case 'halfMappings':
        newStyling = {
          defaultStyle: {
            cad: {
              color: new Color('white')
            }
          },
          groups: [
            {
              style: {
                cad: {
                  color: new Color('red')
                }
              },
              fdmAssetExternalIds: data?.slice(0, Math.floor(data.length / 2)) ?? []
            },
            {
              style: {
                cad: {
                  color: new Color('green')
                }
              },
              fdmAssetExternalIds: data?.slice(Math.floor(data.length / 2)) ?? []
            }
          ]
        };
        break;
      default:
        newStyling = props.styling ?? {};
    }

    return newStyling;
  }, [props.styling, data]);

  return (
    <Reveal3DResources
      resources={props.resources}
      styling={styling}
      fdmAssetMappingConfig={props.fdmAssetMappingConfig}
    />
  );
};
