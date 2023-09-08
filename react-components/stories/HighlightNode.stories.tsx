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
  type FdmAssetStylingGroup,
  useMappedEdgesForRevisions,
  useReveal
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useEffect } from 'react';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

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
  const [stylingGroups, setStylingGroups] = useState<FdmAssetStylingGroup[]>([]);
  const cameraNavigation = useCameraNavigation();
  const nodeData = useClickedNodeData();
  const viewer = useReveal();
  const isEnabled = stylingGroups.length > 0;
  const {data} = useMappedEdgesForRevisions([{modelId:2231774635735416, revisionId: 912809199849811 }], true);

  useEffect(() => {
    console.log('MappedEdges', data);
  }, [data]);

  useEffect(() => {
    if (nodeData?.fdmNode === undefined) {
      setStylingGroups([]);
      return;
    }

    setStylingGroups([
      {
        fdmAssetExternalIds: [
          { externalId: nodeData.fdmNode.externalId, space: nodeData.fdmNode.space }
        ],
        style: { cad: DefaultNodeAppearance.Highlighted }
      }
    ]);
    
    void cameraNavigation.fitCameraToInstance(nodeData.fdmNode.externalId, nodeData.fdmNode.space);
    
    console.log('Clicked node data', nodeData);
  }, [nodeData?.fdmNode]);

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
      <RevealToolbar />
    </>
  );
};
