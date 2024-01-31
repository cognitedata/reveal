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
import {
  type PointCloudObjectCollectionStylingGroup,
  type AssetMappingStylingGroup
} from '../src/components/Reveal3DResources/types';

const meta = {
  title: 'Example/HighlightNode',
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
      },
      {
        modelId: 1350257070750400,
        revisionId: 5110855034466831,
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
    Array<FdmAssetStylingGroup | AssetMappingStylingGroup | PointCloudObjectCollectionStylingGroup>
  >([]);
  const cameraNavigation = useCameraNavigation();
  const nodeData = useClickedNodeData();

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
    } else if (nodeData?.pointCloudAnnotationMappingResult !== undefined) {
      setStylingGroups([
        {
          annotationIds: nodeData.pointCloudAnnotationMappingResult,
          style: { pointcloud: DefaultNodeAppearance.Highlighted }
        }
      ]);
    } else {
      setStylingGroups([]);
    }
  }, [nodeData]);

  return (
    <>
      <RevealResourcesFitCameraOnLoad
        resources={resources}
        defaultResourceStyling={{
          cad: {
            default: { color: new Color('#efefef') },
            mapped: { color: new Color('#c5cbff') }
          },
          pointcloud: {
            default: { color: new Color('#efefef') },
            mapped: { color: new Color('#c5cbff') }
          }
        }}
        instanceStyling={stylingGroups as Array<FdmAssetStylingGroup | AssetMappingStylingGroup>}
        pointCloudInstanceStyling={stylingGroups as PointCloudObjectCollectionStylingGroup[]}
      />
      <RevealToolbar />
    </>
  );
};
