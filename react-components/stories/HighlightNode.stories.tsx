/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  type FdmAssetMappingsConfig,
  RevealContainer,
  RevealToolbar,
  useReveal,
  Reveal3DResources,
  NodeDataResult,
  Reveal3DResourcesProps,
  AddResourceOptions
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useEffect, useState } from 'react';
import {
  CogniteCadModel,
  DefaultNodeAppearance,
  NodeIdNodeCollection,
  TreeIndexNodeCollection,
  type PointerEventData
} from '@cognite/reveal';
import { queryMappedData } from '../src/components/Reveal3DResources/queryMappedData';
import { useFdmSdk, useSDK } from '../src/components/RevealContainer/SDKProvider';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const DefaultFdmConfig: FdmAssetMappingsConfig = {
  source: {
    space: 'hf_3d_schema',
    version: '1',
    type: 'view',
    externalId: 'cdf_3d_connection_data'
  },
  global3dSpace: 'hf_3d_global_data',
  assetFdmSpace: 'hf_customer_a'
};

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
        modelId: 2551525377383868,
        revisionId: 2143672450453400,
        transform: new Matrix4().makeTranslation(-340, -480, 80)
      }
    ],
    styling: {},
    fdmAssetMappingConfig: DefaultFdmConfig
  },
  render: ({ resources, fdmAssetMappingConfig }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} fdmAssetMappingConfig={fdmAssetMappingConfig} />
      </RevealContainer>
    );
  }
};

const StoryContent = ({
  resources,
  fdmAssetMappingConfig
}: {
  resources: AddResourceOptions[];
  fdmAssetMappingConfig: FdmAssetMappingsConfig;
}) => {
  const viewer = useReveal();

  const [nodeData, setNodeData] = useState<any>();

  const callback = (nodeData: NodeDataResult<any>) => {
    setNodeData(nodeData.data);

    if (!(viewer.models[0] instanceof CogniteCadModel)) return;

    viewer.models[0].assignStyledNodeCollection(
      new TreeIndexNodeCollection([nodeData.cadNode.treeIndex]),
      DefaultNodeAppearance.Highlighted
    );
  };

  return (
    <>
      <Reveal3DResources
        resources={resources}
        fdmAssetMappingConfig={fdmAssetMappingConfig}
        onNodeClick={callback}
      />
      <RevealToolbar />
      NodeData is: {JSON.stringify(nodeData)}
    </>
  );
};
