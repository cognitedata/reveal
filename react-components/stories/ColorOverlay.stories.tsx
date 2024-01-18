/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  useClickedNodeData,
  useCameraNavigation,
  type AddResourceOptions,
  type FdmAssetStylingGroup
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useEffect } from 'react';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { type AssetMappingStylingGroup } from '../src/components/Reveal3DResources/types';
import { ColorOverlayRules } from '../src/components/ColorOverlayRules/ColorOverlayRules';

const meta = {
  title: 'Example/ColorOverlay',
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
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [stylingGroups, setStylingGroups] = useState<
    Array<FdmAssetStylingGroup | AssetMappingStylingGroup>
  >([]);
  const cameraNavigation = useCameraNavigation();
  const nodeData = useClickedNodeData();

  const modelOptions = {
    modelId: 1791160622840317,
    revisionId: 498427137020189
  };

  useEffect(() => {
    console.log('Clicked node data', nodeData);
    if (nodeData?.fdmResult !== undefined) {
      setStylingGroups([
        {
          fdmAssetExternalIds: [
            {
              externalId: nodeData.fdmResult.fdmNodes[0].externalId,
              space: nodeData.fdmResult.fdmNodes[0].space
            }
          ],
          style: { cad: DefaultNodeAppearance.Highlighted }
        }
      ]);

      void cameraNavigation.fitCameraToInstance(
        nodeData.fdmResult.fdmNodes[0].externalId,
        nodeData.fdmResult.fdmNodes[0].space
      );
    } else if (nodeData?.assetMappingResult !== undefined) {
      setStylingGroups([
        {
          assetIds: nodeData.assetMappingResult.assetIds,
          style: { cad: DefaultNodeAppearance.Highlighted }
        }
      ]);

      void cameraNavigation.fitCameraToModelNode(
        nodeData.intersection.model.revisionId,
        nodeData.assetMappingResult.cadNode.id
      );
    } else {
      setStylingGroups([]);
    }
  }, [nodeData]);
  const rulesTest = [
    {
      name: 'Equipment type code',
      valueSourceField: 'Equipment type code',
      isStringRule: true,
      subHierarchyAggregationMethod: 'none',
      relevantAssetMetadata: ['Equipment Type Code', 'Equipment Type'],
      threeDObjects: 'all',
      rules: [
        {
          valueString: 'XX',
          color: '#FF0000FF'
        },
        {
          valueString: 'TA',
          color: '#00FF00FF'
        },
        {
          valueString: 'GT',
          color: '#0000FFFF'
        },
        {
          valueString: 'HE',
          color: '#00FFFFFF'
        },
        {
          valueString: 'LC',
          color: '#FF00FFFF'
        },
        {
          valueString: 'AR',
          color: '#FFFF00FF'
        }
      ]
    },
    {
      name: 'PDMS wall thickness',
      valueSourceField: 'Latest_Reading_thickness',
      valueReferenceField: 'retiring_limit',
      isStringRule: false,
      subHierarchyAggregationMethod: 'firstRule',
      relevantAssetMetadata: ['Latest_Reading_thickness', 'retiring_limit'],
      rules: [
        {
          description: 'Below retiring limit',
          valueMax: '1.0',
          valueMin: '0.0',
          color: '#ff0000'
        },
        {
          description: 'Close to retiring limit',
          valueMax: '1.5',
          valueMin: '1.0',
          color: '#ffdc00'
        },
        {
          description: 'Nominal',
          valueMax: '999.0',
          valueMin: '1.5',
          color: '#00ff00'
        }
      ]
    }];
  return (
    <>
      <RevealResourcesFitCameraOnLoad
        resources={resources}
        defaultResourceStyling={{
          cad: {
            default: { color: new Color('#efefef') },
            mapped: { color: new Color('#c5cbff') }
          }
        }}
        instanceStyling={stylingGroups}
      />
      <ColorOverlayRules addModelOptions={modelOptions} rules={rulesTest} />
      <RevealToolbar />
    </>
  );
};
