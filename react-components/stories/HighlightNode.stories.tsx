/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  type NodeDataResult,
  type AddResourceOptions,
  CameraController,
  type FdmAssetStylingGroup
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useCallback, useRef } from 'react';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
        <CameraController
          initialFitCamera={{
            to: 'allModels'
          }}
          cameraControlsOptions={{
            changeCameraTargetOnClick: true,
            mouseWheelAction: 'zoomToCursor'
          }}
        />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);
  const stylingGroupsRef = useRef<FdmAssetStylingGroup[]>([]);
  const callback = async (nodeData: Promise<NodeDataResult | undefined>): Promise<void> => {
    const nodeDataResult = await nodeData;
    setHighlightedId(nodeDataResult?.nodeExternalId);

    if (nodeDataResult === undefined) return;

    nodeDataResult.intersection.model.assignStyledNodeCollection(
      new TreeIndexNodeCollection([nodeDataResult.cadNode.treeIndex]),
      DefaultNodeAppearance.Highlighted
    );
  };

  const onClick = useCallback((nodeData: Promise<NodeDataResult | undefined>) => {
    void callback(nodeData);
  }, []);

  if (stylingGroupsRef.current.length === 1) {
    stylingGroupsRef.current.pop();
  }

  if (highlightedId !== undefined) {
    stylingGroupsRef.current.push({
      fdmAssetExternalIds: [{ externalId: highlightedId, space: 'pdms-mapping' }],
      style: { cad: DefaultNodeAppearance.Highlighted }
    });
  }

  return (
    <>
      <Reveal3DResources
        resources={resources}
        instanceStyling={stylingGroupsRef.current}
        onNodeClick={onClick}
      />
      <RevealToolbar />
    </>
  );
};
